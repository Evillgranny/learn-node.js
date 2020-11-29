const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const webserver = express()

webserver.use(express.static('public'))
webserver.use('/js', express.static(`${__dirname}/public/js`))
webserver.use(bodyParser.json());
webserver.use(bodyParser.urlencoded({ extended: false }))

webserver.set('view engine', 'ejs')
webserver.use('/postman', require('./routes/postman.routes'))
webserver.use('/', require('./routes/client.routes'))

const port = 443

webserver.listen(port,() => {
    console.log('Server start in port ' + port)
})
