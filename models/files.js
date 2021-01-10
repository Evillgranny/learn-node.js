const { Schema, model } = require('mongoose')

const filesModel = new Schema({
    name: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: [String, Number],
        required: true
    },
    comment: {
        type: [String, Number],
        required: false
    }
})

module.exports = model('FilesModel', filesModel)
