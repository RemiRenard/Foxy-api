const Song = require('../models/song')

exports.getSongs = function (user) {
  return Song.find({})
    .exec()
    .then(songs => {
      return Promise.resolve(songs)
    }, error => {
      throw new APIError('unknown')
    })
  }

exports.getSongById = function (songId) {
  return Song.findById(songId)
    .exec()
    .then(song => {
      return Promise.resolve(song)
    }, error => {
      throw new APIError('unknown')
    })
  }
