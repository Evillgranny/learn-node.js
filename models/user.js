const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SALT = 10

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true,`The email field is required!`],
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: [true,`The password field is required!`],
        minlength: 5
    },
    name: {
        type: String,
        required: [true,`The first name field is required!`],
        maxlength: 100
    },
    token: {
        type: String
    },
    status: {
        type: Boolean
    },
    key: {
        type: String
    }
})

//saving user data
userSchema.pre(`save`, function (next) {
    const user = this
    if (user.isModified(`password`)) {//checking if password field is available and modified
        bcrypt.genSalt(SALT, function (err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

//for comparing the users entered password with database duing login
userSchema.methods.comparePassword = function (candidatePassword, callBack) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return callBack(err)
        callBack(null, isMatch)
    })
}

//for generating token when loggedin
userSchema.methods.generateToken = function (callBack) {
    const user = this
    const token = jwt.sign(user._id.toHexString(), process.env.SECRETE)
    user.token = token
    user.save(function (err, user) {
        if (err) return callBack(err)
        callBack(null, user)
    })
}

//validating token for auth routes middleware
userSchema.statics.findByToken = function (token, callBack) {
    const user = this
    jwt.verify(token, process.env.SECRETE, function (err, decode) {//this decode must give user_id if token is valid .ie decode=user_id
        user.findOne({ _id: decode, token: token }, function (err, user) {
            if (err) return callBack(err)
            callBack(null, user)
        })
    })
}

userSchema.methods.generateAuthKey = function (callBack) {
    const user = this
    user.key = Math.random().toString(36).substring(2,26)
    user.status = false
    user.save(function (err, user) {
        if (err) return callBack(err)
        callBack(null, user)
    })
}


userSchema.statics.findByKey = function (key, callBack) {
    const user = this
    jwt.verify(key, process.env.KEY, function (err, decode) {//this decode must give user_id if token is valid .ie decode=user_id
        user.findOne({ _id: decode, key: key }, function (err, user) {
            if (err) return callBack(err)
            callBack(null, user)
        })
    })
}

const User = mongoose.model(`User`, userSchema)
module.exports = { User }
