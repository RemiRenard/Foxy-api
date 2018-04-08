const User = require('../models/user')
const Notif = require('../models/notification')
const Moment = require('moment')

exports.getRanking = function (user) {
  let today = Moment().startOf('day')
  let tomorrow = Moment(today).add(1, 'days')
  let startWeek = Moment().startOf('week')
  let endWeek = Moment(startWeek).add(1, 'weeks')
  let currentUserScore
  let currentUserRank
  let weeklyRanking
  let dailyRanking
  return getRanking(today.toDate(), tomorrow.toDate())
    .then(dailyUsers => {
      dailyRanking = dailyUsers
      return getRanking(startWeek.toDate(), endWeek.toDate())
    })
    .then(weeklyUsers => {
      weeklyRanking = weeklyUsers
      return Notif.aggregate([{
        $match: {
          'type': 'message'
        }
      }, {
        $lookup: { from: 'User', localField: 'userSource', foreignField: '_id', as: 'user' }
      }, {
        $group: { _id: '$user', 'count': { $sum: 1 } }
      }, {
        $sort: { 'count': -1 }
      }])
    })
    .then(items => {
      let users = []
      items.map((item, index) => {
        if (item._id[0]._id == user.id) {
          currentUserScore = item.count
          currentUserRank = index + 1
        }
        if (users.length < 50) {
          users.push({
            username: item._id[0].username,
            avatar: item._id[0].avatar,
            score: item.count
          })
        }
      })
      return Promise.resolve({
        'currentUserData': {
          username: user.username,
          avatar: user.avatar,
          rank: currentUserRank,
          score: currentUserScore
        },
        'globalRanking': users,
        'weeklyRanking': weeklyRanking,
        'dailyRanking': dailyRanking
      })
    })
}

getRanking = function (startTime, endTime) {
  return Notif.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startTime,
          $lt: endTime
        },
        'type': 'message'
      }
    }, {
      $lookup: {
        from: 'User',
        localField: 'userSource',
        foreignField: '_id',
        as: 'user'
      }
    }, {
      $group: {
        _id: '$user',
        'count': { $sum: 1 }
      }
    }, {
      $sort: {
        'count': -1
      }
    }, {
      $limit: 50
    }
  ]).then(items => {
    let users = []
    items.map(function (item) {
      users.push({
        username: item._id[0].username,
        avatar: item._id[0].avatar,
        score: item.count
      })
    })
    return Promise.resolve(users)
  })
}
