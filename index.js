const express = require('express');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const multer  = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const logLineAsync = require('./utils').logLineAsync;

const port = '5695';
const wss = new WebSocket.Server({ port: 5696 });

const index = express();
index.use(cors()) ;
index.use(express.urlencoded({extended:true}));
index.use(bodyParser.urlencoded());
index.use(bodyParser.json());
index.use(express.static('public'));
index.use("/uploads", express.static('uploads'));

const logFileName = path.resolve(__dirname, '_server.log');
const imagesInfoFile = path.resolve(__dirname, 'files.json');

index.use(progressFunc);

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

let clients  = {};

wss.on('connection', function connection(ws, req) {
        const id = req.headers['sec-websocket-key'];

        const idData = JSON.stringify({type: 'ID', data: id});

        logLineAsync(logFileName,`[${port}] connect ${id}`);

        ws.send(idData);

        clients[id] = ({connection: ws, lastKeepAlive: Date.now()});

        ws.on('message', message => {
            if ( message==="KEEP_ME_ALIVE" ) {
                for(let key in clients){
                    if ( clients[key].connection===ws )
                        clients[key].lastKeepAlive=Date.now();
                };
            }
            else
                console.log('сервером получено сообщение от клиента: '+message)
        });
    });

setInterval(()=>{
    for(let key in clients){
        if ( (Date.now()-clients[key].lastKeepAlive) >12000 ) {
            clients[key].connection.terminate();
            clients[key].connection=null;
            logLineAsync(logFileName,`[${port}] `+"один из клиентов отключился, закрываем соединение с ним");
        }
    };

    for (let key in clients){
        if (!clients[key].connection) {
            logLineAsync(logFileName,`[${port}] `+"удаляем соединение");
            console.log( 'delete connection');
            delete clients[key]
        }
    }

},3000);

index.use(multer({dest: 'uploads/'}).single("file"));

index.post('/uploadFile', function (req, res) {

    const id = req.headers.connectionid;

     fs.readFile(imagesInfoFile, (err, data) => {
         if (err)
             logLineAsync(logFileName,`[${port}] /uploadFile readFile ${err}` );

            const imageInfo = req.file;
            const imagesInfo = JSON.parse(data);

            imagesInfo[imageInfo.filename] = {
                name: imageInfo.filename,
                originalName: imageInfo.originalname,
                path: imageInfo.path,
                size: imageInfo.size,
                comment: req.body.comment,
                mimeType: imageInfo.mimeType
            };
            fs.writeFile(imagesInfoFile, JSON.stringify(imagesInfo), (err) => {
                if (err) {
                    logLineAsync(logFileName,`[${port}] /uploadFile writeFile ${err}` );
                    throw err;
                }
                console.log('The file has been saved!');
                logLineAsync(logFileName,`[${port}] `+"The file has been saved");
            });
        clients[id].connection.terminate();
         res.json({data:imagesInfo[imageInfo.filename]});
        });

});

index.get('/files', (req, res) => {

    fs.readFile(imagesInfoFile, (err, data) => {
        if (err)
            logLineAsync(logFileName,`[${port}] /files readFile ${err}` );

        const fileData = JSON.parse(data);

        const names = [];

        for(let key in fileData){
            names.push({originalName: fileData[key].originalName, name: key});
        }

        res.json(names)
    })
});

index.post('/getImageInfo', (req, res) => {
    const {name} = req.body;

    fs.readFile(imagesInfoFile, (err, data) => {
        if (err)
            logLineAsync(logFileName,`[${port}] /getImageInfo readFile ${err}` );

        const fileData = JSON.parse(data);

        res.json(fileData[name])

    })
});

index.listen(port, () => console.log(`server is running on ${port} `));
