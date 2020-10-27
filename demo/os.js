const os = require('os')

console.log('Операнционная система ', os.platform())
console.log('Архитектура процессора ', os.arch())
console.log('Инфа по процессам ', os.cpus())
console.log('Свободная память ', os.freemem())
console.log('Общая память ', os.totalmem() / 1024 / 1024)
console.log('Домашнаяя директория ', os.homedir())
console.log('Система включена ', os.upTime())
