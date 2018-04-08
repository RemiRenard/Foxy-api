const UsersManager = require('../managers/UserManager')

exports.login = function (req, res) {
  UsersManager.login(req.body.email, req.body.password, req.body.deviceId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.loginFacebook = function (req, res) {
  UsersManager.loginFacebook(req.body.facebookId, req.body.facebookToken, req.body.deviceId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}


exports.createAccount = function (req, res) {
  UsersManager.createAccount(req.body.email, req.body.password, req.body.firstName,
    req.body.lastName, req.body.username, req.body.birthday, req.body.deviceId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.verifyEmail = function (req, res) {
  UsersManager.verifyEmail(req.query.email)
    .then(result => {
      res.render('email-verification', { email_verification: result.success })
    }, error => {
      res.error(error)
    })
}

exports.myProfile = function (req, res) {
  UsersManager.myProfile(res.locals.user)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.resetPassword = function (req, res) {
  UsersManager.resetPassword(req.body.user, req.body.newPassword)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.forgotPassword = function (req, res) {
  UsersManager.forgotPassword(req.body.email)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.logout = function (req, res) {
  UsersManager.logout(res.locals.sessionId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.findUsers = function (req, res) {
  UsersManager.findUsers(res.locals.user,req.body.username, req.body.limit, req.body.skip)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.updateAvatar = function (req, res) {
    UsersManager.updateAvatar(res.locals.user,req.file)
      .then(result => {
        res.success(result)
      }, error => {
        res.error(error)
      })
}

exports.updateProfile = function (req, res) {
    UsersManager.updateProfile(res.locals.user,req.body.firstName,
      req.body.lastName, req.body.birthday)
      .then(result => {
        res.success(result)
      }, error => {
        res.error(error)
      })
}

exports.updatePassword = function (req, res) {
    UsersManager.updatePassword(res.locals.user,req.body.oldPass,
      req.body.newPass)
      .then(result => {
        res.success(result)
      }, error => {
        res.error(error)
      })
}
