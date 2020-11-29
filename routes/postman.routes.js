const { Router } = require('express')
const fetch = require("node-fetch")
const {check, validationResult} = require('express-validator')
const router = Router()

router.post(
    '/',
    [
        check('method', 'Choose method').isString(),
        check('url', 'Enter correct link').isURL()
    ],
    (req, res) => {
        try {
            let result = {}

            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                })
            }

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
        } catch (e) {
            res.status(500).json({ errors: {
                    msg: 'Что-то пошло не так, попробуйте снова'
            }})
        }
})

module.exports = router
