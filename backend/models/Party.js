const { model, Schema } = require('mongoose');
//const User = require('../../models/User');
//var userSchema = require('mongoose').model('User').schema

const partySchema = new Schema({
    partyId: String,
    hostId: String,
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    theme: String,
    playlist: {
        type: Schema.Types.ObjectId,
        ref: 'Playlist'
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdAt: String
});

module.exports = model('Party', partySchema);