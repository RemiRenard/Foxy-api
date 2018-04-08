const aws = require('aws-sdk')
const fs = require('fs')

/**
* Upload a song to the server.
* @param {Object} file - the binary file
* @param {string} fileName - name of the file
* @returns {string} Url of the file
*/
exports.uploadSong = function (file, fileName) {
  // Connection to aws to store the song file.
  aws.config.update({
    secretAccessKey: Config.SECRET_ACCESS_KEY,
    accessKeyId: Config.ACCESS_KEY_ID,
    region: Config.REGION
  })
  var s3 = new aws.S3({ apiVersion: '2006-03-01' })
  var uploadParams = { Bucket: 'foxy-sounds', Key: '', Body: '' }

  return new Promise((resolve, reject) => {
    var fileStream = fs.createReadStream(file.path)
    fileStream.on('error', function (err) {
      reject(err)
    })
    uploadParams.Body = fileStream
    uploadParams.Key = fileName
    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data.Location)
      }
    })
  })
}
