const form = document.querySelector('#form')
const errorWrap = document.querySelector('.error')
const progressWrap = document.querySelector('#progress')

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

async function downloadFile(e) {
    const body = JSON.stringify({name: e.target.dataset.name});
    try {
        const response = await fetch(`${backEndServer}/uploads/${e.target.dataset.name}`, {
            method: 'GET',
        } );

        const imageInfoRaw = await fetch(`${backEndServer}/getImageInfo`, {
            method:'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body
        })

        const imageInfo = await imageInfoRaw.json();

        if ( response.ok ) {
            const ab=await response.arrayBuffer();

            const blob = new Blob([ab], { type: imageInfo.mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = imageInfo.originalName;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        else {
            console.error('error loading');
        }
    }
    catch ( err ) {
        console.error(err);
    }
}
