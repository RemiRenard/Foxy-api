const Router = require('express').Router()

// routes
const UserRoutes = require('./routes/users')
const FriendRoutes = require('./routes/friendship')
const NotificationRoutes = require('./routes/notifications')
const RankingRoutes = require('./routes/ranking')
const SongRoutes = require('./routes/songs')
const ConfigRoutes = require('./routes/config')
const Auth = require('./middlewares/auth')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

// CONFIG
Router.get('/config', ConfigRoutes.getConfig)

// USER
Router.get('/user/me', Auth, UserRoutes.myProfile)
Router.get('/user/logout', Auth, UserRoutes.logout)
Router.post('/users', Auth, UserRoutes.findUsers)
Router.post('/user/login', UserRoutes.login)
Router.post('/user/loginFacebook', UserRoutes.loginFacebook)
Router.post('/user/create-account', UserRoutes.createAccount)
Router.post('/user/forgot-password', UserRoutes.forgotPassword)
Router.post('/user/update-avatar', Auth, upload.single('avatar'), UserRoutes.updateAvatar)
Router.post('/user/update', Auth, UserRoutes.updateProfile)
Router.post('/user/update-password', Auth, UserRoutes.updatePassword)

// FRIENDS
Router.get('/friends', Auth, FriendRoutes.getFriends)
Router.get('/friend/requests', Auth, FriendRoutes.getFriendsRequests)
Router.post('/friend/add', Auth, FriendRoutes.addFriend)
Router.post('/friend/accept', Auth, FriendRoutes.acceptFriend)
Router.post('/friend/decline', Auth, FriendRoutes.declineFriend)

// NOTIFICATION
Router.get('/notifications', Auth, NotificationRoutes.getNotifications)
Router.post('/notification/send', Auth, upload.single('song'), NotificationRoutes.send)
Router.post('/notification/mark-as-read', Auth, NotificationRoutes.markNotificationAsRead)

// RANK
Router.get('/ranking', Auth, RankingRoutes.getRanking)

// SONG
Router.get('/songs', Auth, SongRoutes.getSongs)

module.exports = Router
