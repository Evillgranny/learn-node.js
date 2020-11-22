const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')

const webserver = express();

webserver.use(bodyParser.json());
webserver.use(bodyParser.urlencoded({ extended: false }));

webserver.use(expressLayouts)
webserver.set('layout', './layouts/default')
webserver.set('view engine', 'ejs')


webserver.use(express.static('public'))
webserver.use('/js', express.static(`${__dirname}/public/js`))

webserver.get('/', (req,res) => {
    res.render('index', {
        title: 'login'
    })
})

webserver.get('/personal-account', (req, res) => {
    res.render('personal-account', {
        title: 'Personal account',
        username: req.query.username
    })
})

webserver.post('/form', [
    check('login', 'This username must me 3+ characters long')
        .exists()
        .isLength({ min: 3 })
], (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const alert = errors.array()
        res.render('index', {
            alert,
            title: 'login'
        })
    } else {
        res.redirect('/personal-account?username=' + req.body.login, 302)
    }
})

const port = 443;

webserver.listen(port,() => {
    console.log('Server start in port ' + port)
});
