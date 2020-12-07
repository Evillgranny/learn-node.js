const express = require('express')
const app = express()
const http = require('http')
const httpServer = http.Server(app)
const io = require('socket.io')(httpServer)
const SocketIOFile = require('socket.io-file')
const fs = require('fs')

app.set('view engine', 'ejs')

app.get('/', (req, res, next) => {
    let file = fs.readFileSync(__dirname + '/database/data.json', 'utf-8')
    return res.render('index', {
        file
    })
})

app.get('/app.js', (req, res, next) => {
    return res.sendFile(__dirname + '/client/app.js')
})

app.get('/socket.io.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js')
})

app.get('/socket.io-file-client.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js')
})

app.get('/data/:id', (req, res) => {
    const id = req.params.id
    fs.createReadStream(`${__dirname}/data/${id}`).pipe(res)
})

io.on('connection', (socket) => {
    console.log('Socket connected.')
    const uploader = new SocketIOFile(socket, {
        uploadDir: 'data',							// simple directory
        maxFileSize: 41943040,
        chunkSize: 10240,
        transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
        overwrite: true 							// overwrite file if exists, default is true.
    })
    uploader.on('start', async (fileInfo) => {
        console.log('Start uploading')
        let file = JSON.parse(fs.readFileSync(__dirname + '/database/data.json', 'utf-8'))
        file[fileInfo.name] = fileInfo.data.comment
        fs.writeFile(__dirname + '/database/data.json', JSON.stringify(file), () => {
            console.log('done')
        })
    })
    uploader.on('stream', (fileInfo) => {
        console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
    })
    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.')
        console.log(fileInfo)
    })
    uploader.on('error', (err) => {
        console.log('Error!', err)
    })
    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo)
    })
    uploader.on('destroy', (d) => {
        console.log("DESTROY", d)
    })
    socket.on('disconnect', (reason) => {
        console.log('Disconnect', reason)
    })
})

httpServer.listen(3000, () => {
    console.log('Server listening on port 3000')
})

