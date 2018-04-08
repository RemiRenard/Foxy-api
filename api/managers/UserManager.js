const User = require('../models/user')
const Notif = require('../models/notification')
const FacebookAdapter = require('../adapters/FacebookAdapter')
const SessionManager = require('./SessionManager')
const FriendManager = require('./FriendManager')
const Sendgrid = require('sendgrid')(Config.SENDGRID_API_KEY)
const CryptoJS = require('crypto-js')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const directory = 'uploads'
const request = require('request-promise-any')

exports.login = function (email, password, deviceId) {
  let currentUser
  return User.findOne({ email: email }).exec()
  .then(user => {
    currentUser = user
    if (currentUser.password) {
      return currentUser.comparePassword(password)
    } else {
      throw new APIError('login_failed')
    }
  }, error => {
    throw new APIError('login_failed')
  })
  .then(passwordMatch => {
    if (currentUser && passwordMatch) {
      return currentUser.save().then(user => {
        return SessionManager.associate(currentUser, deviceId)
      })
    } else {
      throw new APIError('login_failed')
    }
  })
  .then(function (token) {
    let data = {
      token: token,
      user: currentUser
    }
    return Promise.resolve(data)
  })
}

exports.loginFacebook = function (facebookId, facebookToken, deviceId) {
  let currentUser
  return User.findOne({ facebookId: facebookId }).exec()
  .then(user => {
    // Create a new account
    if (!user) {
      return FacebookAdapter.getProfile(facebookToken, ['email', 'public_profile'])
      .then(profile => {
        user = new User({
          email: profile.email,
          emailVerified: false,
          firstName: profile.first_name,
          lastName: profile.last_name,
          username: profile.name,
          avatar: profile.picture.data.url,
          facebookId: facebookId,
          birthday: new Date()
        })
        return user.save()
      }).then(user => {
        currentUser = user
        // Send mail verification
        let helper = require('sendgrid').mail
        let mail = new helper.Mail(
          new helper.Email('noreply@foxy-app.com', 'Foxy'),
          'Email verification',
          new helper.Email(currentUser.email),
          new helper.Content('text/html', 'body')
        )
        let emailEncrypted = CryptoJS.AES.encrypt(currentUser.email, Config.SK_CRYPTOJS)
        mail.personalizations[0].addSubstitution(new helper.Substitution(
          '-EmailConfirmUrl-', 'http://foxy-api.herokuapp.com/email-verification?email=' + encodeURIComponent(emailEncrypted)))
          mail.personalizations[0].addSubstitution(new helper.Substitution(
            '-firstName-', currentUser.firstName))
            mail.personalizations[0].addSubstitution(new helper.Substitution(
              '-lastName-', currentUser.lastName))
              mail.setTemplateId(Config.SENDGRID_TEMPLATE_CONFIRM_MAIL_ID)
              let request = Sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
              })
              return Sendgrid.API(request)
              .then(result => {
                // Create the session
                return SessionManager.associate(user, deviceId)
              }, error => {
                console.log('Failed to send email to ' + email + ', error :' + JSON.stringify(error))
              })
            }).then(function (token) {
              let data = {
                token: token,
                user: currentUser
              }
              return data
            })
            // Login with facebook
          } else {
            return SessionManager.associate(user, deviceId)
            .then(token => {
              let data = {
                token: token,
                user: user
              }
              return data
            })
          }
        }, error => {
          throw new APIError('login_failed')
        })
      }

exports.createAccount = function (email, password, firstName, lastName, username, birthday, deviceId) {
  let currentUser
  return User.find({ email: email }).limit(1).exec()
  .then(users => {
    if (users.length) { throw new APIError('email_taken') } else {
      return User.find({ username: username }).limit(1).exec()
    }
  }).then(users => {
    if (users.length) { throw new APIError('username_taken') } else {
      return generateHash(password)
    }
  }).then(hash => {
    user = new User({
      email: email,
      password: hash,
      emailVerified: false,
      firstName: firstName,
      lastName: lastName,
      username: username,
      birthday: birthday
    })
    return user.save()
  }).then(function (user) {
    currentUser = user
    // Send mail verification
    let helper = require('sendgrid').mail
    let mail = new helper.Mail(
      new helper.Email('noreply@foxy-app.com', 'Foxy'),
      'Email verification',
      new helper.Email(email),
      new helper.Content('text/html', 'body')
    )
    let emailEncrypted = CryptoJS.AES.encrypt(email, Config.SK_CRYPTOJS)
    mail.personalizations[0].addSubstitution(new helper.Substitution(
      '-EmailConfirmUrl-', 'http://foxy-api.herokuapp.com/email-verification?email=' + encodeURIComponent(emailEncrypted)))
      mail.personalizations[0].addSubstitution(new helper.Substitution(
        '-firstName-', firstName))
        mail.personalizations[0].addSubstitution(new helper.Substitution(
          '-lastName-', lastName))
          mail.setTemplateId(Config.SENDGRID_TEMPLATE_CONFIRM_MAIL_ID)
          let request = Sendgrid.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
          })
          return Sendgrid.API(request)
          .then(result => {
            // Create the session
            return SessionManager.associate(user, deviceId)
          }, error => {
            console.log('Failed to send email to ' + email + ', error :' + JSON.stringify(error))
          })
        }).then(function (token) {
          let data = {
            token: token,
            user: currentUser
          }
          return data
        })
      }

exports.verifyEmail = function (emailEncrypted) {
  let bytes = CryptoJS.AES.decrypt(emailEncrypted, Config.SK_CRYPTOJS)
  let email = bytes.toString(CryptoJS.enc.Utf8)
  return User.findOneAndUpdate(
    { email: email },
    { emailVerified: true }
  ).exec()
  .then(user => {
    if (user != null) {
      return Promise.resolve({ success: true })
    } else {
      throw new APIError('user_not_found')
    }
  }, error => {
    throw new APIError('unknown')
  })
}

exports.forgotPassword = function (email) {
  return User.findOne({ 'email': email })
  .exec()
  .then(user => {
    if (user !== null) {
      // Send an email
      let helper = require('sendgrid').mail
      let mail = new helper.Mail(
        new helper.Email('noreply@foxy-app.com', 'Foxy'),
        'Reset your password',
        new helper.Email(email),
        new helper.Content('text/html', 'body')
      )
      let userIdEncrypted = CryptoJS.AES.encrypt(user.id, Config.SK_CRYPTOJS)
      mail.personalizations[0].addSubstitution(new helper.Substitution(
        '-resetPasswordUrl-', 'http://foxy-api.herokuapp.com/reset-password?user=' + encodeURIComponent(userIdEncrypted)))
        mail.personalizations[0].addSubstitution(new helper.Substitution(
          '-username-', user.username))
          mail.setTemplateId(Config.SENDGRID_TEMPLATE_RESET_PASSWORD_ID)
          var request = Sendgrid.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
          })
          return Sendgrid.API(request)
          .then(result => {
            return Promise.resolve({ success: true })
          }, error => {
            console.log('FAIL to send email forgot password for the email :' +
            email + ' error : ' + JSON.stringify(console.error()))
            throw new APIError('unknown')
          })
        } else {
          throw new APIError('user_not_found')
        }
      }, error => {
        throw new APIError('unknown')
      })
    }

exports.resetPassword = function (userIdEncrypted, newPassword) {
  let bytes = CryptoJS.AES.decrypt(userIdEncrypted, Config.SK_CRYPTOJS)
  if (bytes.sigBytes > 0) {
    let userId = bytes.toString(CryptoJS.enc.Utf8)
    return generateHash(newPassword).then(hash => {
      return User.findByIdAndUpdate(
        userId,
        { password: hash }
      ).exec().then(user => {
        if (user != null) {
          return Promise.resolve({ success: true })
        } else {
          throw new APIError('user_not_found')
        }
      }, error => {
        throw new APIError('unknown')
      })
    })
  } else {
    console.log('UserId encrypted error')
    throw new APIError('unknown')
  }
}

exports.logout = function (sessionId) {
  return SessionManager.removeSessionById(sessionId)
  .then(result => {
    return Promise.resolve({ success: true })
  }, error => {
    throw new APIError('unknown')
  })
}

exports.myProfile = function (user) {
  let topSongs = []
  return Notif.aggregate([{
    $lookup: {
      from: 'User',
      localField: 'userSource',
      foreignField: '_id',
      as: 'userSource'
    }
  },
  { $match: { 'userSource': user, 'type': 'message' } },
  {
    $group: {
      _id: '$song',
      'count': { $sum: 1 }
    }
  }, {
    $sort: {
      'count': -1
    }
  }, {
    $limit: 5
  }])
  .then(result => {
    result.map(function (song) {
      if (song._id == Config.SONG_NOTIF_DEFAULT) {
        name = 'default'
      } else if (song._id.indexOf('https://foxy-sounds.s3.eu-west-3.amazonaws.com/song_') !== -1) {
        name = 'custom'
      } else {
        // Get the name of the file (uri parsing)
        name = song._id.split('/').pop().slice(0, -4).split('_').join(' ')
      }
      topSongs.push({
        uri: song._id,
        nbUsed: song.count,
        name: name
      })
    })
    return Notif.aggregate([
      {
        $lookup: {
          from: 'User',
          localField: 'userDestination',
          foreignField: '_id',
          as: 'user'
        }
      }, {
        $lookup: {
          from: 'User',
          localField: 'userSource',
          foreignField: '_id',
          as: 'userSource'
        }
      },
      { $match: { 'userSource': user, 'type': 'message' } },
      {
        $group: {
          _id: '$user',
          'count': { $sum: 1 }
        }
      }, {
        $sort: {
          'count': -1
        }
      }, {
        $limit: 5
      }
    ])
  })
  .then(result => {
    let topFriends = []
    result.map(function (user) {
      topFriends.push({
        username: user._id[0].username,
        nbNotifSent: user.count
      })
    })
    let userDetails = {
      'id': user.id,
      'email': user.email,
      'emailVerified': user.emailVerified,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'username': user.username,
      'birthday': user.birthday,
      'avatar': user.avatar,
      'stats': {
        'topSongs': topSongs,
        'topFriends': topFriends
      }
    }
    return Promise.resolve(userDetails)
  })
}

exports.findUsers = function (user, username, limit, skip) {
  return FriendManager.getFriends(user)
  .then(friends => {
    let friendsId = []
    friends.map(function (friend) {
      friendsId.push(friend.id)
    })
    return User.find({ '_id': { $nin: friendsId, $ne: user.id }, 'username': new RegExp(username, 'i') }).limit(limit).skip(skip)
    .exec()
    .then(users => {
      return Promise.resolve(users)
    }, error => {
      console.log('findUsers error:' + error)
      throw new APIError('unknown')
    })
  })
}

exports.updateAvatar = function (user, file) {
  aws.config.update({
    secretAccessKey: Config.SECRET_ACCESS_KEY,
    accessKeyId: Config.ACCESS_KEY_ID,
    region: Config.REGION
  })
  var s3 = new aws.S3({ apiVersion: '2006-03-01' })
  var uploadParams = { Bucket: 'foxy-avatars', Key: '', Body: '' }
  return new Promise((resolve, reject) => {
    var ext = path.extname(file.originalname).toLowerCase()
    var fileTypeValid = '|.jpg|.png|.jpeg|.gif|'.indexOf(ext) !== -1

    if (fileTypeValid) {
      var fileStream = fs.createReadStream(file.path)
      fileStream.on('error', function (err) {
        reject(err)
      })
      uploadParams.Body = fileStream
      uploadParams.Key = 'avatar_' + user.username + ext
      // call S3 to retrieve upload file to specified bucket
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          reject(err)
        } else {
          User.findOneAndUpdate({ '_id': user.id }, { $set: { avatar: data.Location } })
          .exec()
          .then(result => {
            fs.unlink(path.join(directory, file.filename), err => {
              if (err) reject(err)
            })
            resolve(result)
          }, error => {
            throw new APIError('unknown')
          })
        }
      })
    } else {
      fs.unlink(path.join(directory, file.filename), err => {
        if (err) reject(err)
      })
      throw new APIError('wrong_file_extension')
    }
  })
}

exports.updateProfile = function (user, firstName, lastName, birthday) {
  var valid = /\d/.test(lastName) || /\d/.test(firstName) || !(new Date(birthday)).getTime() > 0
  if (valid) {
    throw new APIError('wrong_data_type')
  } else {
    return User.findOneAndUpdate({ '_id': user.id }, { firstName: firstName, lastName: lastName, birthday: birthday })
    .exec()
    .then(result => {
      return Promise.resolve({ success: true })
    }, error => {
      throw new APIError('update_failed')
    })
  }
}

exports.updatePassword = function (user, oldPass, newPass) {
  return User.findOne({ _id: user.id }).exec()
  .then(user => {
    return user.comparePassword(oldPass)
  }, error => {
    throw new APIError('user_not_found')
  })
  .then(passwordMatch => {
    if (passwordMatch) {
      return generateHash(newPass)
      .then(hash => {
        return User.findOneAndUpdate({ _id: user.id }, { password: hash })
        .exec()
        .then(result => {
          return Promise.resolve({ success: true })
        }, error => {
          throw new APIError('update_failed')
        })
      }, error => {
        console.log('Unable to genarate hash')
        throw new APIError('unknown')
      })
    } else {
      throw new APIError('login_failed')
    }
  }, error => {
    console.log('Unable to match passwords')
    throw new APIError('unknown')
  })
}

generateHash = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) { reject(err) } else {
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) { reject(err) } else {
            resolve(hash)
          }
        })
      }
    })
  })
}
