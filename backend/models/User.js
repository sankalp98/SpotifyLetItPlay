const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    country: String,
    display_name: String,
    email: String,
    href: String,
    spotify_id: String,
})

module.exports = model('User', userSchema);


/*
{
    "country": "SE",
    "display_name": "JM Wizzler",
    "email": "email@example.com",
    "external_urls": {
        "spotify": "https://open.spotify.com/user/wizzler"
    },
    "followers": {
        "href": null,
        "total": 3829
    },
    "href": "https://api.spotify.com/v1/users/wizzler",
    "id": "wizzler",
    "images": [
        {
            "height": null,
            "url": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-frc3/t1.0-1/1970403_10152215092574354_1798272330_n.jpg",
            "width": null
        }
    ],
    "product": "premium",
    "type": "user",
    "uri": "spotify:user:wizzler"
}
*/