const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const fetch = require("node-fetch");

const webserver = express();
webserver.use(express.static(__dirname + '/public'))

webserver.post('/postman', jsonParser, (req, res) => {
    if (req.body.method === 'GET') {
        let contentType = null
        let headers = null

        req.body.contentType ? contentType = req.body.ContentType : false
        req.body.headers ? headers = req.body.headers : false

        console.log(req.body.url + req.body.query)
        fetch(`${req.body.url + req.body.query}`, {
            method: 'GET',
            headers: {
                ...contentType,
                ...headers
            }
        })
            .then(res => console.log(res))
            .catch(err => console.log(err))
    } else {
        console.log('post')
    }
    res.send('=)')
})

const port = 443;

webserver.listen(port,()=>{
    console.log('Server start in port ' + port)
});
