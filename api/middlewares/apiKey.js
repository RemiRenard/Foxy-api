const apiKey = Config.API_KEY;

module.exports = function (req, res, next) {
    if (req.header("X-API-Key") == apiKey) {
        next();
    } else {
        res.error("unauthorized", "API key is invalid.");
    }
}
