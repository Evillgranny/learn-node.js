const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.set('view engine', 'ejs')

const urlencodedParser = bodyParser.urlencoded({extended: false})

app.get('/form', (request,response) => {
    response.render('form', {
        invalidUserName: false,
        invalidUserSurname: false,
    })
})

app.post('/form', urlencodedParser, (request, response) => {
    let invalid = false
    for (let i in request.body) {
        request.body[i].length === 0 ? invalid = true : false
    }

    if (!invalid) {
        response.render('success-form', {
            userName: request.body.userName,
            userSurname: request.body.userSurname
        })
    } else {
        let errorUserName = false,
            errorUserSurname = false,
            userName = '',
            userSurname = ''

        !request.body.userName ? errorUserName = true : userName = request.body.userName
        !request.body.userSurname ? errorUserSurname = true : userSurname = request.body.userSurname

        response.render('form', {
            invalidUserName: errorUserName,
            invalidUserSurname: errorUserSurname,
        })
    }
})

app.listen(443, () => {
    console.log('Server is running...')
})

