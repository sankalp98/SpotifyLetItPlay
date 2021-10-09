const { model, Schema } = require('mongoose');

var trackSchema = new Schema({
    disc_number: Number,
    duration_ms: Number,
    explicit: Boolean,
    href: String,
    id: String,
    is_local: Boolean,
    name: String,
    popularity: Number,
    preview_url: String,
    track_number: Number,
    type: String,
    uri: String
});

const playlistSchema = new Schema({
    partyId: String,
    name: String,
    spotifyPlaylistId: String,
    uri: String,
    tracks: [trackSchema],
    createdAt: String
});

module.exports = model('Playlist', playlistSchema);