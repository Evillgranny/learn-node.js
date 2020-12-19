const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer') // для обработки тел запроса в формате multipart/form-data
const progress = require('progress-stream') // для отслеживания прогресса приёма файла (вариант №1)
const webserver = express()
const WebSocket = require('ws')
const cors = require('cors')
const bodyParser = require('body-parser')

const wss = new WebSocket.Server({ port: 5000 })

webserver.use(cors()) ;
webserver.use(express.urlencoded({extended: true}));
webserver.use(bodyParser.urlencoded());
webserver.use(bodyParser.json());
webserver.set('view engine', 'ejs')

const imagesInfoFile = path.resolve(__dirname, 'files.json');

webserver.use(progressFunc);

function progressFunc(req, res, next) {
    const size = req.headers['content-length'];
    let data = 0;

    const id = req.headers.connectionid;

    req.on('data', chunk => {
        data += chunk.length;
        const dataString = JSON.stringify({type: 'UPLOAD_PERCENT', data: (data/size * 100).toFixed(2)});
        if (clients[id]) {
            clients[id].connection.send(dataString)
        }
        else {
            console.log(`${clients[id]} Клиент отключен`);
        }
    });
    next()
}

let clients  = {}

wss.on('connection', function connection(ws, req) {
    const id = req.headers['sec-websocket-key']

    const idData = JSON.stringify({type: 'ID', data: id})

    ws.send(idData)

    clients[id] = ({connection: ws, lastKeepAlive: Date.now()})

    ws.on('message', message => {
        if ( message==="KEEP_ME_ALIVE" ) {
            for(let key in clients){
                if ( clients[key].connection===ws )
                    clients[key].lastKeepAlive=Date.now();
            }
        }
        else
            console.log('сервером получено сообщение от клиента: '+message)
    })
})

setInterval(()=>{
    for(let key in clients){
        if ( (Date.now()-clients[key].lastKeepAlive) >12000 ) {
            clients[key].connection.terminate();
            clients[key].connection=null;
        }
    };

    for (let key in clients){
        if (!clients[key].connection) {
            console.log( 'delete connection');
            delete clients[key]
        }
    }

},3000)

webserver.use(multer({dest: 'uploads/'}).single("myFile"))

webserver.post('/upload', (req, res) => {
    const id = req.headers.connectionid;

    fs.readFile(imagesInfoFile, (err, data) => {
        if (err) console.log('Error: ', err)

        const imageInfo = req.file;
        console.log('req: ', req.file)
        console.log('data: ', data)
        const imagesInfo = JSON.parse(data)

        imagesInfo[imageInfo.filename] = {
            name: imageInfo.filename,
            originalName: imageInfo.originalname,
            path: imageInfo.path,
            size: imageInfo.size,
            comment: req.body.comment,
            mimeType: imageInfo.mimeType
        }
        fs.writeFile(imagesInfoFile, JSON.stringify(imagesInfo), (err) => {
            if (err) {
                console.log('Error ', 'error')
                throw err
            }
            console.log('The file has been saved!');
        })
        clients[id].connection.terminate();
        res.json({data:imagesInfo[imageInfo.filename]});
    })
})

webserver.get('/', (req, res) => {
    let files = fs.readFileSync(__dirname + '/files.json', 'utf-8')
    files = JSON.parse(files)
    res.render('index', {
        files
    })
})

webserver.get('/script.js', (req,res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'script.js'))
})

webserver.get('/files/:id', (req, res) => {
    const id = req.params.id
    fs.createReadStream(`${__dirname}/uploads/${id}`).pipe(res)
})

const port = 443
webserver.listen(port,() => {
    console.log('start')
})
