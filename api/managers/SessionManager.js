const Session = require('../models/session')
const Installation = require("../models/installation");
const jwt = require('jsonwebtoken')
const randomInt = require('random-int');

exports.associate = function (user, deviceId) {
  //@TODO replace by a UUID
  let randomJwtId = randomInt(1000, 1000000);
  return Installation.find({ deviceId: deviceId }).limit(1).exec()
    .then(installations => {
      if (installations.length) {
        return installations[0]
      } else {
        installation = new Installation({
          deviceId: deviceId
        })
        return installation.save()
      }
    }).then(installation => {
      return Session.find({ user: user.id, installation: installation.id }).exec()
        .then(sessions => {
          if (sessions.length) {
            return Session.findOneAndUpdate(
              { installation: installation.id },
              { jwtId: randomJwtId },
              { new: true, upsert: true }
            )
          } else {
            session = new Session({
              user: user.id,
              installation: installation.id,
              jwtId: randomJwtId
            });
            return session.save()
          }
        })
    })
    .then(session => {
      return jwt.sign({
        data: {
          installationId: session.installation,
          userId: user.id,
          jwtId: randomJwtId
        }
      }, Config.SK_TOKEN_JWT, { expiresIn: '365 days' })
    })
}

exports.getSessionsByUsers = function (userIds) {
  return Session.find({ user: { $in: userIds } })
    .populate('installation')
    .then(sessions => {
      return Promise.resolve(sessions)
    }, error => {
      throw new APIError('unknown')
    })
}

exports.removeSessionById = function (sessionId) {
  return Session.findOneAndRemove({ _id: sessionId })
    .then(result => {
      return Promise.resolve(result)
    }, error => {
      throw new APIError('unknown')
    })
}
