const mongoose = require("mongoose");

let collectionName = "Notification";

let schema = new mongoose.Schema({
    userSource: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userDestination: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, required: true },
    isRead: { type: Boolean, required: false },
    message: { type: String, required: true },
    type: { type: String, required: false },
    song: { type: String, required: false }
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
