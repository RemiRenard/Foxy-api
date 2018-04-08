const Session = require('../models/session')
const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  let token = req.header('Authorization')
  if (token) {
    jwt.verify(token, Config.SK_TOKEN_JWT, function (err, decoded) {
      if (err) {
        if (err.name == 'TokenExpiredError') {
          res.error('session_expired')
        } else {
          res.error('unauthorized', 'Authentication information could not be validated')
        }
      } else {
        // fetch the session associated to the token
        Session.find({ installation: decoded.data.installationId, user: decoded.data.userId }).populate('user').limit(1).exec()
          .then(sessions => {
            let session = sessions[0]
            if (session.jwtId == decoded.data.jwtId) {
              res.locals.user = session.user
              res.locals.sessionId = session.id
              next()
            } else {
              res.error('session_expired')
            }
          }, error => {
            res.error(error)
          })
      }
    })
  } else {
    res.error('unauthorized', 'You must be logged in to perform this action.')
  }
}
