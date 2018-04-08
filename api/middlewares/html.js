const apiKey = Config.API_KEY;

module.exports = function (req, res, next) {
    res.setHeader('Content-Type', 'text/html')
    next();
}
