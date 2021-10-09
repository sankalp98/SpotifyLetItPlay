const { UserInputError } = require('apollo-server-errors');
const Party = require('../../models/Party')
const User = require('../../models/User')
const Playlist = require('../../models/Playlist')
const queryString = require('query-string')
const axios = require('axios')

var generateRandomString = function(length) {
    var text = '';
    var possible = '0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

module.exports = {
    Query: {
        async getParties(){
            try{
                const parties = await Party.find();
                return parties;
            } catch(err){
                throw new Error(err);
            }
        },
        async createParty(_, {theme, access_token, spotify_id}, context, info)
        { 
            const user = await User.findOne({spotify_id: spotify_id})
            if(!user)
            {
                throw new UserInputError("User doesnt exist")
            }

            const party = await Party.findOne({hostId: spotify_id})
            if(!party)
            {
                const resultbruh = await axios({
                    method: 'post',
                    url: 'https://api.spotify.com/v1/users/'+spotify_id+'/playlists',
                    data: {
                        name: 'SK Party Playlist',
                        public: false,
                        collaborative: true
                    },
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                        'Content-Type':'application/json'
                    }
                  }).then(async function (response) {
                    //console.log(response);
                    const data = response.data
                    console.log("Newly created Playlist")
                    console.log(data);

                    const partyId = "12345"
                    const newpartyId = generateRandomString(5)
                    const newPlaylist = new Playlist({
                        partyId: newpartyId,
                        name: data.name,
                        spotifyPlaylistId: data.id,
                        uri: data.uri,
                        tracks: []
                    })
                    const playlist = await newPlaylist.save();
                    console.log("This is the Playlist")
                    console.log(playlist);

                    //let members = [user.id]
                    let members = []
                    //const somepartyId = generateRandomString(5)
                    //console.log(somepartyId)

                    const newParty = new Party({
                        partyId: newpartyId,
                        hostId: spotify_id,
                        host: user.id,
                        theme,
                        playlist: playlist.id,
                        members
                    })
                    const res = await newParty.save();
                    console.log("This is the Party")
                    console.log(res);

                    return res
                  })
                  .catch(function (error) {
                    console.log(error);
                    throw new UserInputError("The playlist could not be created, so the party was not created.")
                  });

                return resultbruh
            }

            throw new UserInputError("A party already exists that is created by user. Cannot create more than 1 party.")
        },
        async deleteParty(_, {partyId, spotify_id}, context, info)
        {
            const party = await Party.findOne({partyId: partyId})
            if(party.hostId == spotify_id)
            {
                const playlist = await Playlist.findOne({partyId: partyId})
                if(party)
                {
                    await party.delete()
                    await playlist.delete()
                    return "Deleted Successfully."
                }
                else
                {
                    throw new UserInputError("No such party found that is created by user. Deletion Failed.")
                }
            }
            else
            {
                throw new UserInputError("User does not permission to delete the party.")
            }
        },
        async joinParty(_, {partyId, access_token, spotify_id}, context, info)
        {
            const party = await Party.findOne({partyId: partyId}).populate('members', 'playlist')
            const tracksarray = []
            //const playlist = party.playlist
            //console.log(playlist)
            if(party)
            {
                const user = await User.findOne({spotify_id: spotify_id})
                if(user)
                {
                    console.log(party.members)
                    var result = party.members.find(obj => {
                        return obj._id == user.id
                      })
                    if(!result)
                    {
                        party.members.unshift(user.id)
                        await party.save()
                        console.log("User joined the party successfully")
                        const playlist = await Playlist.findOne({partyId: partyId})
                        //tracksarray = playlist.tracks
                        var i;
                        for (i = 0; i < playlist.tracks.length; i++) {
                            tracksarray.push(playlist.tracks[i].uri)
                        }
                        await axios({
                            method: 'get',
                            url: 'https://api.spotify.com/v1/me/top/tracks',
                            headers: {
                                'Authorization': 'Bearer ' + access_token,
                                'Content-Type':'application/x-www-form-urlencoded'
                            }
                          }).then(async function (response) {
                            //console.log(response);
                            data = response.data
                            console.log(data);
                            data.items.forEach(function (arrayItem) {
                                const newTrack = {
                                    disc_number: arrayItem.disc_number,
                                    duration_ms: arrayItem.duration_ms,
                                    explicit: arrayItem.explicit,
                                    href: arrayItem.href,
                                    id: arrayItem.id,
                                    is_local: arrayItem.is_local,
                                    name: arrayItem.name,
                                    popularity: arrayItem.popularity,
                                    preview_url: arrayItem.preview_url,
                                    track_number: arrayItem.track_number,
                                    type: arrayItem.type,
                                    uri: arrayItem.uri
                                }
                                console.log(newTrack)
                                //console.log(playlist.tracks)
                                var trackIndexInPlaylist = tracksarray.indexOf(newTrack.uri)
                                if(trackIndexInPlaylist == -1)
                                {
                                    playlist.tracks.push(newTrack)
                                    tracksarray.push(newTrack.uri)
                                }
                                //tracksarray.push(arrayItem.uri)
                                
                            });
                            await playlist.save()
                            console.log("Successfully added user's top tracks to mongodb database playlist")
                          })
                          .catch(function (error) {
                            console.log(error);
                            console.log("Failed")
                          });

                          const spotifyplaylistid = playlist.spotifyPlaylistId
                          console.log(tracksarray)
                          await axios({
                            method: 'post',
                            url: 'https://api.spotify.com/v1/playlists/'+spotifyplaylistid+'/tracks',
                            data: {
                                uris: tracksarray
                            },
                            headers: {
                                'Authorization': 'Bearer ' + access_token,
                                'Content-Type':'application/json'
                            }
                          }).then(async function (response) {
                            //console.log(response);
                            
                            
                            console.log("Successfully added user's top tracks uris to spotify database playlist")
                          })
                          .catch(function (error) {
                            console.log(error);
                            console.log("Failed")
                          });
            
                        return party
                    }
                    else
                    {
                        throw new UserInputError("You are already in the party")
                    }
                }
                else
                {
                    throw new UserInputError("User not found")
                }
            }
            else{
                throw new UserInputError("Party not found")
            }
        },
        async leaveParty(_, {partyId, access_token, spotify_id}, context, info)
        {
            const party = await Party.findOne({partyId: partyId}).populate('members')

            if(party)
            {
                const user = await User.findOne({spotify_id: spotify_id})
                if(user)
                {
                    console.log(party.members)
                    var resultIndex = party.members.findIndex(obj => obj._id == user.id)
                    if(resultIndex!=-1)
                    {
                        party.members.splice(resultIndex, 1);
                        await party.save()
                        return "User left the party successfully"
                    }
                    else
                    {
                        throw new UserInputError("User is not in the party.")
                    }
                }
                else
                {
                    throw new UserInputError("User not found")
                }
            }
            else{
                throw new UserInputError("Party not found")
            }
        },
        async printUsersTopTracksOrArtists(_, {access_token, spotify_id}, context, info)
        {
            const res = await axios({
                method: 'get',
                url: 'https://api.spotify.com/v1/me/top/tracks',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type':'application/x-www-form-urlencoded'
                }
              }).then(function (response) {
                //console.log(response);
                data = response.data
                console.log(data);

                return "Success"
              })
              .catch(function (error) {
                console.log(error);
                return "Some error occured"
              });

            return res
        }
    }
}