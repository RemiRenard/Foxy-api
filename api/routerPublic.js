const RouterPublic = require('express').Router()

// routes specific
const UserRoutes = require('./routes/users')

// PUBLIC ROUTE
RouterPublic.get('/', function (req, res) { res.render('home') })
RouterPublic.get('/reset-password', function (req, res) { res.render('reset-password') })
RouterPublic.get('/privacy-policy', function (req, res) { res.render('privacy-policy') })
RouterPublic.get('/terms-and-conditions', function (req, res) { res.render('terms-and-conditions') })
RouterPublic.post('/reset-password', UserRoutes.resetPassword)
RouterPublic.get('/email-verification', UserRoutes.verifyEmail)

module.exports = RouterPublic
