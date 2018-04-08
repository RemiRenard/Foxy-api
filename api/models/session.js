const mongoose = require("mongoose");

let collectionName = "Session";

let schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    installation: { type: mongoose.Schema.Types.ObjectId, ref: "Installation" },
    jwtId: { type: String }
}, { collection: collectionName });

schema.set("toObject", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret
    }
});

schema.set("toJSON", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret
    }
});

module.exports = mongoose.model(collectionName, schema);
