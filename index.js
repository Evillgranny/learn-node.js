const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const webserver = express();

webserver.use(express.urlencoded({extended:true}));

const port = 443;
const logFN = path.join(__dirname, '_server.log');

function logLineSync(logFilePath,logLine) {
    const logDT=new Date();
    let time=logDT.toLocaleDateString()+" "+logDT.toLocaleTimeString();
    let fullLogLine=time+" "+logLine;

    console.log(fullLogLine); // выводим сообщение в консоль

    const logFd = fs.openSync(logFilePath, 'a+'); // и это же сообщение добавляем в лог-файл
    fs.writeSync(logFd, fullLogLine + os.EOL); // os.EOL - это символ конца строки, он разный для разных ОС
    fs.closeSync(logFd);
}

webserver.get('/', (req, res) => {
    logLineSync(logFN,`[${port}] `+'index called');
    res.sendFile(__dirname + "/public/index.html");
});

webserver.post('/', async (req, res) => {
    const file = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf-8'))
    file[req.body.vote].votes += 1
    await fs.writeFileSync(__dirname + '/data.json', JSON.stringify(file, null, 2))
    await res.sendFile(__dirname + "/public/index.html");
})

webserver.get('/variants', (req, res) => {
    logLineSync(logFN,`[${port}] `+'variants called')
    const data = require(__dirname + '/data.json')
    res.send(JSON.stringify(data))
})

webserver.listen(port,()=>{
    logLineSync(logFN,"web server running on port "+port);
});
