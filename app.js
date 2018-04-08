var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

// connect to db
mongoose.Promise = require('bluebird')
mongoose.set('debug', true)
mongoose.connect(Config.MONGODB_URI, {
  useMongoClient: true
})

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.disable('x-powered-by')
app.set('json spaces', 4) // for pretty printing in browser
app.use(function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('X-Powered-By', 'Foxy')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.success = function (obj) { res.send(APIResponse(obj)) }
  res.error = function (param1, param2) {
    let error
    if (param1.constructor === APIError) { error = param1 } else if (typeof (param1) === 'string') { error = new APIError(param1, param2) } else {
      if (param1.statusCode == 400 || param1.status == 400) {
        error = new APIError('invalid_request', param1.message || 'Unknown error')
      } else {
        error = new APIError('unknown')
      }
    }
    res.status(error.status).send({
      'success': false,
      'error': {
        'code': error.code,
        'message': error.message
      }
    })
  }
  next()
})

app.options('/api/*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-API-Key')
  res.end()
})

app.use('/api', require('./api/middlewares/apiKey'), require('./api/router'))
app.use('/', require('./api/middlewares/html'), require('./api/routerPublic'))

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500)
  res.send(JSON.stringify(err))
})

var listener = app.listen(8888, function () {
  console.log('Listening on port ' + listener.address().port) // Listening on port 8888
})

module.exports = app
