const gcm = require('node-gcm')
const Notif = require('../models/notification')
const SessionManager = require('./SessionManager')
const SongManager = require('./SongManager')
const NotificationManager = require('./NotificationManager')
const AwsAdapter = require('../adapters/AwsAdapter')
const path = require('path')
const directory = 'uploads'

exports.getNotifications = function (user) {
  return Notif.find({ userDestination: user.id })
  .limit(25)
  .populate('userSource')
  .sort({
    createdAt: -1 // Sort by createdAt DESC
  })
  .exec()
  .then(notifications => {
    return Promise.resolve(notifications)
  })
}

exports.getDeviceIds = function (userIds) {
  if (typeof (userIds) === 'string') { userIds = [userIds] }
  return SessionManager.getSessionsByUsers(userIds)
  .then(sessions => {
    tokens = sessions.map(session => {
      return session.installation.deviceId
    })
    return Promise.resolve(tokens)
  })
}

exports.addNotification = function (user, userIds, message, type, song) {
  if(!message){ message = "Powered by Foxy" }
  const notifsPromises = userIds.map(i => {
    return new Promise((resolve, reject) => {
      let notif = new Notif({
        userDestination: i,
        userSource: user.id,
        createdAt: Date.now(),
        isRead: false,
        message: message,
        type: type,
        song: song
      })
      notif.save((error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  })
  return Promise.all(notifsPromises)
}

exports.sendNotification = function (user, messageNotif, songId, type, userIds, songFile) {
  let message;
  usersIds = userIds.replace(/\s/g, '').split(',')
  // Create a promise.
  return new Promise((resolve, reject) => {
    // Check the extension
    if (songFile && path.extname(songFile.originalname).toLowerCase() == '.mp3') {
      return AwsAdapter.uploadSong(songFile, "song_" + Date.now() + ".mp3")
      .then(songLocation => {
        resolve(songLocation)
      })
    } else if (songId) {
      return SongManager.getSongById(songId)
      .then(song => {
        resolve(song.url)
      })
    } else {
      resolve(Config.SONG_NOTIF_DEFAULT)
    }
  }).then(location => {
    // Prepare a message to be sent
    message = new gcm.Message({
      data: {
        user: user,
        message: messageNotif,
        song: location
      }
    })
    // Specify which registration IDs to deliver the message
    return NotificationManager.addNotification(user, usersIds, messageNotif, type, message.params.data.song)
    .then(results => {
      return NotificationManager.getDeviceIds(usersIds)
    }).then(deviceIds => {
      // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
      let sender = new gcm.Sender(Config.FIREBASE_PUSH_KEY)
      // Actually send the message
      sender.send(message, { registrationTokens: deviceIds }, function (err, response) { })
      return Promise.resolve({ success: true })
    })
  })
}

exports.markNotificationAsRead = function (notificationId) {
  return Notif.findOneAndUpdate({ '_id': notificationId }, { $set: { isRead: true } })
  .exec()
  .then(result => {
    return Promise.resolve({ 'success': true })
  }, error => {
    throw new APIError('unknown')
  })
}

exports.deleteNotification = function (notificationId) {
  return Notif.findOneAndRemove({ '_id': notificationId }).exec()
}
