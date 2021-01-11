const { Router } = require('express')
const router = Router()
const fs = require('fs')
const path = require('path')
const FilesModel = require('../models/files')
const clients = require('../utils/wsClients')
const { auth } = require('../middleware/auth')
const { User } = require(`../models/user`)
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const progressFunc = require('../middleware/progess')

router.post('/', [auth, progressFunc, upload.single("myFile")], (req, res) => {
    if (!req.file) res.status(400).send('No file')

    const id = req.headers.connectionid
    const imageInfo = req.file

    const imagesInfo = {
        name: imageInfo.filename,
        originalName: imageInfo.originalname,
        path: imageInfo.path,
        size: imageInfo.size,
        comment: req.body.comment,
        mimeType: imageInfo.mimeType
    }

    const filesModel = new FilesModel(imagesInfo)

    filesModel.save()
        .then(() => {
            clients[id].connection.terminate()
            res.json({data: imagesInfo})
        })
        .catch(e => {
            console.log(e)
        })
})

router.get('/', auth, async (req, res) => {
    let token = req.cookies.authToken
    User.findByToken(token, async (err, user) => {
        if (err) {
            return res.render('login', {
                error: 'У нас что-то сломалось, но не вините себя.',
                message: false
            })
        }

        const name = user.name
        const files = await FilesModel.find()
        res.render('upload', {
            files,
            name
        })
    })
})

router.get('/files', auth, async (req, res) => {
    const files = await FilesModel.find()
    res.json(files)
})

router.get('/files/:id', auth,  (req, res) => {
    const id = req.params.id
    fs.createReadStream(path.join(__dirname, '..', 'uploads', id)).pipe(res)
})

module.exports = router
