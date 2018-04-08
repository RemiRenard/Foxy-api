const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let collectionName = 'User'

let schema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: false },
  emailVerified: { type: Boolean, required: true},
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  birthday: { type: Date, required: true },
  facebookId: { type: String, required: false },
  avatar: { type: String, required: false }
}, { collection: collectionName })

schema.set('toObject', {
  transform: function (doc, ret, options) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.active
    delete ret.password
    delete ret.facebookId
    return ret
  }
})

schema.set('toJSON', {
  transform: function (doc, ret, options) {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.active
    delete ret.password
    delete ret.facebookId
    return ret
  }
})

schema.methods.comparePassword = function (password) {
  let user = this
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, function (err, isMatch) {
      if (err) {
        reject(err)
      } else {
        resolve(isMatch)
      }
    })
  })
}

module.exports = mongoose.model(collectionName, schema)
