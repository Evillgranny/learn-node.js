// File System
const fs = require('fs')
const path = require('path')

// fs.mkdir(path.join(__dirname, 'test'), (err) => {
//     if (err) {
//         throw err
//     }
//
//     console.log('Папака создана')
// })

// Создать файл, записать и добавить

const filePath = path.join(__dirname, 'test', 'text.txt')
// fs.writeFile(filePath, 'Hello Node.js!!!', (err) => {
//     if (err) {
//         throw err
//     }
//
//     console.log('Файл создан')
//     })
//
// fs.appendFile(filePath, '\nHello Again!!!', (err) => {
//     if (err) {
//         throw err
//     }
//
//     console.log('Файл создан')
// })

fs.readFile(filePath, (err, content) => {
    if (err) {
        throw err
    }

    console.log(content)
    // const data = Buffer.from(content)
    // console.log('Content: ', data.toString())
})
