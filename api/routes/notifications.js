const NotificationManager = require('../managers/NotificationManager')

exports.send = function (req, res) {
  NotificationManager.sendNotification(res.locals.user,
    req.body.message, req.body.songId, req.body.type, req.body.userIds, req.file)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.getNotifications = function (req, res) {
  NotificationManager.getNotifications(res.locals.user)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.markNotificationAsRead = function (req, res) {
  NotificationManager.markNotificationAsRead(req.body.notificationId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}
