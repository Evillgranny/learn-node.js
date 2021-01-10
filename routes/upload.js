const { Router } = require('express')
const router = Router()
const fs = require('fs')
const path = require('path')
const FilesModel = require('../models/files')
const clients = require('../utils/wsClients')
const progress = require('../middleware/progess')
const { auth } = require('../middleware/auth')

router.post('/', progress, auth, async (req, res) => {
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
    try {
        await filesModel.save()
    } catch (e) {
        console.log(e)
    }

    clients[id].connection.terminate()
    res.json({data: imagesInfo})
})

router.get('/', auth, async (req, res) => {
    const files = await FilesModel.find()
    res.render('upload', {
        files
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
