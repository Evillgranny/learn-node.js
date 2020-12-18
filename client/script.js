const form = document.querySelector('#form')
const file = document.querySelector('#myFile')

form.addEventListener('submit', async e => {
    e.preventDefault()
    const formdata = new FormData(form)

    fetch('/upload', {
        method: 'POST',
        body: formdata
    })

    const url = 'ws://localhost:5000'
    let connection = await new WebSocket(url) // это сокет-соединение с сервером

    connection.onopen = event => {
        connection.send('hello from client to server!') // можно послать строку, Blob или ArrayBuffer
    }

    connection.onmessage =  event => {
        console.log('клиентом получено сообщение от сервера: ' + event.data) // это сработает, когда сервер пришлёт какое-либо сообщение
        document.querySelector('#progress').textContent = event.data
    }

    connection.onerror = error => {
        console.log('WebSocket error:', error)
    }

    connection.onclose = () => {
        console.log("соединение с сервером закрыто")
        connection = null
        clearInterval(keepAliveTimer)
    }

    // чтобы сервер знал, что этот клиент ещё жив, будем регулярно слать ему сообщение "я жив"
    let keepAliveTimer = setInterval(() => {
        connection.send('KEEP_ME_ALIVE'); // вот эту строчку бы зашарить с сервером!
    },5000) // и это число!
})
