const FriendManager = require('../managers/FriendManager')

exports.getFriends = function (req, res) {
  FriendManager.getFriends(res.locals.user)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.getFriendsRequests = function (req, res) {
  FriendManager.getFriendsRequests(res.locals.user)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.addFriend = function (req, res) {
  FriendManager.addFriend(res.locals.user, req.body.userId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}
exports.acceptFriend = function (req, res) {
  FriendManager.acceptFriend(res.locals.user, req.body.friendRequestId, req.body.notificationId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}

exports.declineFriend = function (req, res) {
  FriendManager.declineFriend(res.locals.user, req.body.friendRequestId, req.body.notificationId)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}
