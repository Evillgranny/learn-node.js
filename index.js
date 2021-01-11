const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const uploadRoutes = require('./routes/upload')
const authRoutes = require('./routes/auth')
const clients = require('./utils/wsClients')
const cookieParser = require('cookie-parser')
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 5000 })
require('dotenv').config()

wss.on('connection', function connection(ws, req) {
    const id = req.headers['sec-websocket-key']
    const idData = JSON.stringify({type: 'ID', data: id})
    ws.send(idData)

    clients[id] = ({connection: ws, lastKeepAlive: Date.now()})

    ws.on('message', message => {
        if ( message==="KEEP_ME_ALIVE" ) {
            console.log('KEEP_ME_ALIVE')
            for(let key in clients){
                if ( clients[key].connection===ws )
                    clients[key].lastKeepAlive=Date.now()
            }
        }
        else
            console.log('сервером получено сообщение от клиента: ' + message)
    })
})

setInterval(()=>{
    for(let key in clients) {
        if ((Date.now()-clients[key].lastKeepAlive) > 12000 ) {
            clients[key].connection.terminate()
            clients[key].connection=null
        }

        if (!clients[key].connection) {
            console.log( 'delete connection')
            delete clients[key]
        }
    }
},3000)

app.use(express.static(path.join(__dirname, 'client')))
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser());
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use('/upload', uploadRoutes)
app.use('/', authRoutes)

const port = process.env.PORT || 443
const start = async () => {
    try {
        const url = process.env.DATABASE
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        app.listen(port,() => {
            console.log(`Server has been started on port ${port}...`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()
