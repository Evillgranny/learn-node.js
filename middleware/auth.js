const { User } = require(`../models/user`)

const auth = (req, res, next) => {
    let token = req.cookies.authToken
    User.findByToken(token, (err, user) => {
        if (err) throw err
        if (!user) {
            return res.render('login', {
                error: 'Необходимо войти!',
                message: false
            })
        }
        if (!user.status) {
            return res.render('login', {
                error: 'Подтвердите свою почту',
                message: false
            })
        }
        req.token = token
        req.user = user
        next()
    })
}

module.exports = { auth }
