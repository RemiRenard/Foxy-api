const mongoose = require("mongoose");

let collectionName = "Installation";

let schema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android", "web"], required: false },
    language: { type: String, enum: ["en", "fr"], required: false },
    appVersion: { type: String, required: false }
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
