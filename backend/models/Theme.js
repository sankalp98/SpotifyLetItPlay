const { model, Schema } = require('mongoose');

const themeSchema = new Schema({
    name: String,
    createdAt: String
});

module.exports = model('Theme', themeSchema);