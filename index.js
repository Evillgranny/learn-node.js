const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer') // для обработки тел запроса в формате multipart/form-data
const progress = require('progress-stream') // для отслеживания прогресса приёма файла (вариант №1)
const webserver = express()
const WebSocket = require('ws');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

webserver.set('view engine', 'ejs')

webserver.get('/', (req,res) => {
    res.render('index')
})

webserver.get('/script.js', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'script.js'))
})

webserver.use(express.urlencoded({extended:true}))

let clients=[] // здесь будут хэши вида { connection:, lastkeepalive:NNN }

let timer = 0

var server = new WebSocket.Server({ port: 5000 })


const uploadConf = upload.single('myFile')
webserver.post('/upload', async (req, res) => {
    server.on('connection', async connection => {
        var fileProgress = progress()

        const fileLength = +req.headers['content-length'] // берём длину всего тела запроса

        req.pipe(fileProgress) // поток с телом запроса направляем в progress

        fileProgress.headers = req.headers // и ставим в progress те же заголовки что были у req

        fileProgress.on('progress', info => {
            console.log('loaded '+info.transferred+' bytes of '+fileLength)
            connection.send('loaded '+info.transferred+' bytes of '+fileLength)
        })

        uploadConf(fileProgress, res, async (err) => {
            if (err) return res.status(500)
            console.log('file saved, origin filename='+fileProgress.file.originalname+', store filename='+fileProgress.file.filename)
            connection.send('File saved ' + fileProgress.file.filename)
            res.send("ok login="+fileProgress.body.login)
        })
    })
});

const port = 443
webserver.listen(port,() => {
    console.log('start')
})
