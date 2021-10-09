const { model, Schema } = require('mongoose');

const songSchema = new Schema({
    name: String,
    type: String,
    duration: Number,
    artistNames: [String],
    createdAt: String
});

module.exports = model('Song', songSchema);