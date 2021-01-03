const {Router} = require('express')
const router = Router()
const Sequelize = require('sequelize')
const sequelize = require('../utils/database')

router.post('/', async (req, res) => {
    try {
      let [result, metadata] = await sequelize.query(req.body.query)
      res.json({result, metadata})
    } catch (e) {
        res.json({error: e})
    }
})

module.exports = router
