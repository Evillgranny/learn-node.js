const express = require('express')
const path = require('path')
const fs = require('fs')
const bodyParser = require('body-parser')
const webserver = express()
const { createGzip } = require('zlib')
const { pipeline } = require('stream')
const {
    createReadStream,
    createWriteStream
} = require('fs')
const gzip = createGzip()

webserver.use(express.static('public'))
webserver.use(bodyParser.json())
webserver.use(bodyParser.urlencoded({ extended: false }))

const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Enter path to folder: '
})

const getFiles = function (dir, files_){
    files_ = files_ || []
    const files = fs.readdirSync(dir)
    for (const i in files) {
        const name = dir + '/' + files[i]
        if (fs.statSync(name).isDirectory()){
            files_.push('directory: ' + files[i])
            getFiles(name, files_)
        } else {
            if (path.extname(files[i]) === '.gz') {
                files_.push(files[i])
            } else {
                const filters = files.filter(item => {
                    return item === files[i] + '.gz'
                })
                if (filters.length) {
                    files_.push(files[i])
                    fs.stat(name, (err, stats) => {
                        const fileBirth = stats.mtimeMs
                        fs.stat(name + '.gz', async (err, stats) => {
                            const zipBirth = stats.mtimeMs
                            if (fileBirth > zipBirth) {
                                const source = createReadStream(name)
                                const destination = createWriteStream(name + '.gz')

                                pipeline(source, gzip, destination, (err) => {
                                    if (err) {
                                        console.error('An error occurred:', err)
                                        process.exitCode = 1
                                    }
                                })
                            }
                        })
                    })
                } else {
                    const source = createReadStream(name)
                    const destination = createWriteStream(name + '.gz')

                    pipeline(source, gzip, destination, (err) => {
                        if (err) {
                            console.error('An error occurred:', err)
                            process.exitCode = 1
                        }
                    })

                    files_.push(files[i])
                    files_.push(files[i] + '.gz')
                }
            }
        }
    }
    return files_
};

rl.prompt(); // выдать prompt и ждать ответа
rl.on('line', async link => {
    try {
        if ( !link ) {
            console.log('Вы ничего не ввели')
            rl.prompt()
        } else {
            const res = getFiles(path.resolve(__dirname, 'content'))
            console.log(res)
            rl.prompt() // снова выдать prompt и ждать ответа
        }
    } catch (e) {console.log(e)}
})

rl.on('close', () => {
    // сюда придём либо по Ctrl+C, либо по вводу пустой строки в ответ на prompt
    console.log('До свидания!')
    process.exit(0) // выход с признаком успешного завершения
})

