const express = require('express')
const fs = require('fs')
const path = require('path')
const os = require('os')
const webserver = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

webserver.use(express.urlencoded({extended:true}))
webserver.use(express.static(__dirname + '/public'))


const port = 443;
const logFN = path.join(__dirname, '_server.log')

function logLineSync(logFilePath,logLine) {
    const logDT=new Date();
    let time=logDT.toLocaleDateString()+" "+logDT.toLocaleTimeString();
    let fullLogLine=time+" "+logLine;

    console.log(fullLogLine); // выводим сообщение в консоль

    const logFd = fs.openSync(logFilePath, 'a+'); // и это же сообщение добавляем в лог-файл
    fs.writeSync(logFd, fullLogLine + os.EOL); // os.EOL - это символ конца строки, он разный для разных ОС
    fs.closeSync(logFd);
}

webserver.get('/variants', (req, res) => {
    logLineSync(logFN,`[${port}] `+'variants called')
    res.sendFile(__dirname + '/variants.json')
})

webserver.get('/stat', (req, res) => {
    logLineSync(logFN,`[${port}] `+'stat called')
    res.sendFile(__dirname + '/stat.json')
})

webserver.post('/stat', jsonParser, async (req, res) => {
    let file = JSON.parse(fs.readFileSync(__dirname + '/stat.json', 'utf-8'))
    file[req.body.vote] = Number(file[req.body.vote]) + 1

    fs.writeFile(__dirname + '/stat.json', JSON.stringify(file, null, 2), (error) => {
        if(error) throw error;
        res.status(200).send(200)
    })
})

webserver.listen(port,()=>{
    logLineSync(logFN,"web server running on port "+port);
});
