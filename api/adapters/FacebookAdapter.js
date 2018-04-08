const request = require('request-promise-any')

/**
* Get profile informations from facebook
* @param {string} token facebookToken
* @param {string[]} requiredProfilePermissions - Example ['email', 'public_profile']
* @returns {Object} Json which contains profile informations
*/
exports.getProfile = function (token, requiredProfilePermissions) {
  return new Promise((resolve, reject) => {
    fetchTokenPermissions(token)
    .then(permissions => {
      if (validatePermissions(permissions, requiredProfilePermissions)) {
        return request({
          baseUrl: 'https://graph.facebook.com',
          uri: 'me',
          qs: {
            access_token: token,
            fields: 'email, first_name, last_name, picture.width(300).height(300), name'
          }
        })
      } else {
        throw new APIError('facebook_permissions')
      }
    })
    .then(result => {
      let json = JSON.parse(result)
      resolve(json)
    }, requestError => {
      let error
      try {
        error = JSON.parse(requestError.error).error
        reject(new APIError('facebook_error', error.message || null, requestError.statusCode))
      } catch (e) {
        reject(e)
      }
    })
  })
}

validatePermissions = function (data, required) {
  if (!data || !data.length) { return false }
  let granted = data.filter(obj => {
    return obj.status == 'granted'
  })
  .map(obj => {
    return obj.permission
  })
  for (let i = 0; i < required.length; i++) {
    if (granted.indexOf(required[i]) == -1) {
      return false
    }
  }
  return true
}

fetchTokenPermissions = function (token) {
  return request({
    baseUrl: 'https://graph.facebook.com',
    uri: 'me/permissions',
    qs: { access_token: token }
  })
  .then(result => {
    let permissions
    try {
      permissions = JSON.parse(result).data
      return Promise.resolve(permissions)
    } catch (e) {
      return Promise.reject(new APIError('facebook_error'))
    }
  })
}
