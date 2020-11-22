const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const fetch = require("node-fetch");


const webserver = express();
webserver.use(express.static(__dirname + '/public'))
webserver.use(bodyParser.json());
webserver.use(bodyParser.urlencoded({ extended: false }));

webserver.post('/postman', (req, res) => {
    let result = {}
    if (req.body.method === 'GET') {
        fetch(req.body.url + req.body.query, {
            headers: {
                ...req.body.headers,
                ...req.body.contentType,
            }
        })
            .then(async res =>  {
                result.status = res.status
                result.headers = res.headers.raw()
                result.body = await res.text().then(res => res)
            })
            .then(() => {
                console.log('Postman called, method get')
                res.send(result)
            })
            .catch(e => {
                console.log(e)
            })
    } else if (req.body.method === 'POST') {
        fetch(req.body.url + req.body.query, {
            method: 'POST',
            headers: {
                ...req.body.headers,
                ...req.body.contentType,
            },
            body: {
                ...req.body.body
            }
        })
            .then(async res =>  {
                result.status = res.status
                result.headers = res.headers.raw()
                result.body = await res.text().then(res => res)
            })
            .then(() => {
                console.log('Postman called, method post')
                res.send(result)
            })
            .catch(e => {
                console.log(e)
            })
    }
})
const port = 443;

webserver.listen(port,() => {
    console.log('Server start in port ' + port)
});
