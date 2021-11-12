const express = require('express')
const router = express.Router()

const initializeApp = require('./initializeapp')
const applyPromo = require('./applypromo')
const changePassword = require('./changepassword')
const changeEmail = require('./changeemail')
const stripeKey = require('./stripekey')
const lang = require('./lang')
const logout = require('./logout')
const plansChange = require('./plansChange')
const plansAvailable = require('./plansAvailable')
const stripeDefaultCard = require('./stripedefaultcard')


router.get('/hello', function (req, res) {
  // res.json({ custom: 'response' });
  res.status(200).send('Hello World!')
})

router.get('/initializeapp', initializeApp)
router.get('/stripekey', stripeKey)
router.get('/lang', lang)
router.get('/acorn/plans/available', plansAvailable)
router.get('/stripedefaultcard', stripeDefaultCard)
router.get('/logout', logout)

router.post('/applypromo', applyPromo)
router.post('/changepassword', changePassword)
router.post('/changeemail', changeEmail)
router.post('/acorn/plans/change', plansChange)


module.exports = router
