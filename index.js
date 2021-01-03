const express = require('express')
const path = require('path')
const queriesRoutes = require('./routes/queries')
const sequelize = require('./utils/database')

const app = express()
const PORT = process.env.PORT || 443

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use('/api/queries', queriesRoutes)

const start = async () => {
    try {
        await sequelize.sync()
        app.listen(PORT, () => {
            console.log('Server has been stated on port ' + PORT + '...')
        })
    } catch (e) {
        console.log(e)
    }
}

start()
