exports.getConfig = function (req, res) {
  res.success({
    minAndroidVersion: Config.MIN_ANDROID_VERSION,
    minIOSVersion: Config.MIN_IOS_VERSION
  })
}
