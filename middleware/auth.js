const { User } = require(`../models/user`)

const auth = (req, res, next) => {
    let token = req.cookies.authToken
    User.findByToken(token, (err, user) => {
        if (err) throw err
        if (!user) return res.redirect('/')
        req.token = token
        req.user = user
        next()
    })
}

module.exports = { auth }
