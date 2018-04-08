const mongoose = require("mongoose");

let collectionName = "Song";

let schema = new mongoose.Schema({
    name: { type: String },
    url: { type: String },
    picture: { type: String }
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
