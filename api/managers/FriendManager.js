const gcm = require('node-gcm')
const Friendship = require('../models/friendship')
const Notif = require('../models/notification')
const NotificationManager = require('./NotificationManager')

exports.getFriends = function (user) {
  return Friendship.find({ friends: user.id, status: 'accepted' })
    .populate('friends')
    .sort('createdAt')
    .exec()
    .then(friendships => {
      let friends = []
      friendships.map(function (friendship) {
        friendship.friends.map(function (friend) {
          if (friend.id != user.id) {
            friends.push(friend)
          }
        })
      })
      return Promise.resolve(friends)
    }, error => {
      throw new APIError('unknown')
    })
}

exports.getFriendsRequests = function (user) {
  return Friendship.find({ friends: user.id, status: 'requested', requestedBy: { $ne: user.id } })
    .populate('requestedBy')
    .sort('createdAt')
    .exec()
    .then(friendships => {
      let friendRequests = []
      friendships.filter(function (friendship) {
        return (friendship.requestedBy != user.id)
      }).map(function (friendship) {
        friendship.friends.filter(function (friend) {
          return (friend == user.id)
        }).map(function (userId) {
          friendRequests.push({
            'notificationId': friendship.notificationId,
            'requestedBy': friendship.requestedBy,
            'requestId': friendship.id
          })
        })
      })
      return Promise.resolve(friendRequests)
    }, error => {
      throw new APIError('unknown')
    })
}

exports.addFriend = function (currentUser, userIdTarget) {
  let notifId
  let messageNotif = 'Friend request'
  let songNotif = Config.SONG_NOTIF_DEFAULT
  let notif = new Notif({
    userDestination: userIdTarget,
    userSource: currentUser,
    createdAt: Date.now(),
    isRead: false,
    message: messageNotif,
    type: 'friendRequest',
    song: songNotif
  })
  // Prepare a message to be sent
  let message = new gcm.Message({
    data: {
      user: currentUser,
      message: messageNotif,
      song: songNotif
    }
  })
  return notif.save()
    .then(notif => {
      notifId = notif.id
      return NotificationManager.getDeviceIds(userIdTarget)
    })
    .then(deviceIds => {
      // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
      let sender = new gcm.Sender(Config.FIREBASE_PUSH_KEY)
      // Actually send the message
      sender.send(message, { registrationTokens: deviceIds }, function (err, response) { })
      return Promise.resolve({ success: true })
    })
    .then(result => {
      let friendship = new Friendship({
        status: 'requested',
        friends: [currentUser.id, userIdTarget],
        requestedBy: currentUser.id,
        createdAt: new Date(),
        notificationId: notifId
      })
      return friendship.save()
        .then(friendship => {
          return Promise.resolve({ success: true })
        }, error => {
          throw new APIError('unknown')
        })
    })
}

exports.acceptFriend = function (currentUser, friendshipId, notificationId) {
  return Friendship.findByIdAndUpdate(
    friendshipId,
    { status: 'accepted', notificationId: '' }
  ).exec().then(friendship => {
    return NotificationManager.deleteNotification(notificationId)
      .then(result => {
        return Promise.resolve({ success: true })
      })
  }, error => {
    throw new APIError('unknown')
  })
}

exports.declineFriend = function (currentUser, friendshipId, notificationId) {
  return Friendship.findByIdAndUpdate(
    friendshipId,
    { status: 'declined', notificationId: '' }
  ).exec().then(friendship => {
    return NotificationManager.deleteNotification(notificationId)
      .then(result => {
        return Promise.resolve({ success: true })
      })
  }, error => {
    throw new APIError('unknown')
  })
}
