const form = document.querySelector('#form')
const file = document.querySelector('#myFile')
const errorWrap = document.querySelector('.error')
const progressWrap = document.querySelector('#progress')
const list = document.querySelector('#list')

const url = 'ws://localhost:5000'
let ws = null

form.addEventListener('submit', sendForm)

let reOpenTimer = null
let keepAliveTimer = null

let connectionId = null
let uploadPercent = null

function start (websocketServerLocation) {
    ws = new WebSocket(websocketServerLocation)
    ws.onopen =  async function (e) {
        console.log('соединение установлено')
        addError({errorInfo:""})

        ws.send('KEEP_ME_ALIVE')
    }

    ws.onclose = function () {
        console.log("соединение с сервером закрыто")
        progressWrap.textContent = 'Файл загржен'
        ws = null
        clearInterval(keepAliveTimer)
    }

    ws.onmessage = async function (res) {

        const message = JSON.parse(res.data)
        console.log(message)
        switch (message.type) {
            case 'ID':
                connectionId = message.data
                const data = new FormData(form)
                keepAlive()
                uploadDataService(data)
                console.log('connectionId', connectionId)
                reOpenTimer = null
                break
            case 'UPLOAD_PERCENT':
                uploadPercent = message.data
                progressWrap.textContent = `${uploadPercent}%`
                break
            case 'ERROR':
                addError({errorInfo: message.data})
                break
        }
    }

    ws.onerror = error => {
        addError({errorInfo:"Сервер недоступен"})
        progressWrap.textContent = ''
        setTimeout(() => sendForm() , 5000)
        clearInterval(keepAliveTimer)
        console.log('WebSocket error:',error)
    }
}

async function uploadDataService (data) {
    if (!file.files.length) return

    try {
        const response = await fetch(`/upload`, {
            method: 'POST',
            headers:{
                connectionid: connectionId
            },
            body: data
        })

        const res = await response.json()

        form.reset()

        await downloadFilesList()

        if (res.error){
            addError(res.error)
        }
    }
    catch (e) {
        addError({errorInfo:'Ошибка при загрузке'})
        if (!reOpenTimer)
            reOpenTimer = setTimeout(() => sendForm(), 3000)
        console.error(e)
    }
}

function keepAlive () {
    keepAliveTimer = setInterval(()=>{
        ws.send('KEEP_ME_ALIVE')
    },5000)
}

function addError (error) {
    errorWrap.textContent = error.errorInfo
}

async function sendForm(e) {
    if (e) e.preventDefault()
    start(url)
}

async function downloadFilesList () {
    const response = await fetch(`/files`, {
        method: 'GET',
    })

    const res = await response.json()

    list.innerHTML = ''

    for (let key in res) {
        let name = res[key].originalName
        let comment = res[key].comment
        let path = key

        const item = document.createElement('li')
        const link = document.createElement('a')
        const br = document.createElement('br')
        const br2 = document.createElement('br')
        const hr = document.createElement('hr')
        item.append(name)
        item.append(br)
        item.append(comment)
        item.append(br2)
        link.download = name
        link.textContent = 'Скачать'
        link.href = `/files/${path}`
        item.append(link)
        item.append(hr)

        list.append(item)
    }
}
