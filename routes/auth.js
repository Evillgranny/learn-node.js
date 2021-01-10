const { Router } = require('express')
const router = Router()
const { User } = require('../models/user')
const { auth } = require('../middleware/auth')
const nodemailer = require("nodemailer")
const regEmail = require('../emails/registration')

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.MAIL_PASSWORD
    }
})


router.get('/', (req, res) => {
    res.render('login' )
})

router.post('/login', (req,res) => {
    User.findOne({ 'email': req.body.email }, (err, user) => {
        // Есть ли такой email
        // Если нету, то ...
        if (!user) {
            return res.status(404).json({success: false, message: 'User email not found!'})
        } else {
            // Если есть то...
            user.comparePassword(req.body.password, (err, isMatch) => {
                console.log(isMatch)
                // Правильный ли пароль
                // Если нет, то...
                if (!isMatch) {
                    return res.status(400).json({success: false, message: 'Wrong Password!'})
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

    })
})

router.post('/register', async (req,res) => {
    const user = new User(req.body);
    await user.save((err, doc) => {
        if (err) {
            return res.status(422).json({errors: err})
        } else {
            user.generateAuthKey(async (err, user) => {
                console.log(user.key, user.status)
                if (err) {
                    return res.status(400).send({err})
                } else {
                    res.redirect('/')
                    await transporter.sendMail(regEmail(req.body.email, user.key), (err) => {
                        if (err) console.log(err)
                        else console.log('Сообщение отправлено')
                    })
                }
            })
        }
    })
})

router.get('/logout', auth, (req, res) => {
    User.findByIdAndUpdate(
        { _id: req.user._id },
        { token: '' },
        (err) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).render('login')
    })
})

module.exports = router
