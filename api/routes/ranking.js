const RankingManager = require('../managers/RankingManager')

exports.getRanking = function (req, res) {
  RankingManager.getRanking(res.locals.user)
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
