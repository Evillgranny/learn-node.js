const { Router } = require('express')
const router = Router()
const { User } = require('../models/user')
const { auth } = require('../middleware/auth')
const nodemailer = require("nodemailer")
const regEmail = require('../emails/registration')
const mailKeys = require('../emails/keys')

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
        user: '',
        pass: ''
    }
})

router.get('/', (req, res) => {
    res.render('login', {
        error: false,
        message: false
    })
})

router.post('/login', (req,res) => {
    User.findOne({ 'email': req.body.email }, (err, user) => {
        // Есть ли такой email
        // Если нету, то ...
        if (!user) {
            return res.render('login', {
                error: 'Такого email нет',
                message: false
            })
        } else {
            // Если есть то...
            user.comparePassword(req.body.password, (err, isMatch) => {
                // Правильный ли пароль
                // Если нет, то...
                if (!isMatch) {
                    return res.render('login', {
                        error: 'Ошибочный email или пароль',
                        message: false
                    })
                } else {
                    // Если да то...
                    user.generateToken((err, user) => {
                        if (err) {
                            return res.status(400).send({err})
                        } else {
                            res.cookie('authToken', user.token).redirect('/upload')
                        }
                    })
                }
            })
        }
    })
})

router.get('/register',(req, res) => {
    res.render('register', {
        error: false
    })
})

router.post('/register', async (req,res) => {
    const user = new User(req.body);
    await user.save((err, doc) => {
        if (err) {
            return res.render('register', {
                error: 'Такой email уже существует'
            })
        } else {
            user.generateAuthKey(async (err, user) => {
                if (err) {
                    return res.render('register', {
                        error: 'Неизвестная ошибка, попробуйте позже'
                    })
                } else {
                    await transporter.sendMail(regEmail(req.body.email, user.key), (err) => {
                        if (err) {
                            res.render('register', {
                                error: 'Ошибка отправки сообщения'
                            })
                        } else {
                            res.render('login', {
                                error: false,
                                message: 'Вам на почту отправлен email. Пройдите по ссылке в письме для завершения регистрации'
                            })
                        }
                    })
                }
            })
        }
    })
})

router.get(`/registration/:key`, async (req, res) => {
    try {
        const key = req.params.key
        const user = await User.findOne({key})
        if (!user) {
            res.render('login', {
                error: 'Ссылка не действительна. Обратитесь на другой сайт, для хранения ваших файлов.',
                message: false
            })
        }
        user.status = true
        user.key = ''
        await user.save()
        res.render('login', {
            error: false,
            message: 'Вы успешно зарегистрировались'
        })
    } catch (e) {
        console.log(e)
    }
})

router.get('/logout', auth, (req, res) => {
    User.findByIdAndUpdate(
        { _id: req.user._id },
        { token: '' },
        (err) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).render('login', {
            error: false,
            message: false
        })
    })
})

module.exports = router
