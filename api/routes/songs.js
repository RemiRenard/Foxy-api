const SongManager = require('../managers/SongManager')

exports.getSongs = function (req, res) {
  SongManager.getSongs(res.locals.user)
    .then(result => {
      res.success(result)
    }, error => {
      res.error(error)
    })
}
