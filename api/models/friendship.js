const mongoose = require("mongoose");

let collectionName = "Friendship";

let schema = new mongoose.Schema({
    status: { type: String, required: true },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },],
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, required: true },
    notificationId: { type: String, required: true }
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
