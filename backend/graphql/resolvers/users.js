const User = require('../../models/User')
const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, access_token, refresh_token} = require('../../config.js')
const queryString = require('query-string')
const axios = require('axios')
const btoa = require('btoa');
const { UserInputError } = require('apollo-server-errors');

module.exports = {
    Query: {
        async getURLForAuthentication(){
            var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private user-read-recently-played user-top-read user-library-read';
            const URL = 'https://accounts.spotify.com/authorize?'+queryString.stringify({response_type: 'code',client_id: CLIENT_ID,scope: scope,redirect_uri: REDIRECT_URL,show_dialog:'true'});
            
            return {
                url: URL
            }
        },
        async exchangeCodeForAccessAndRefreshTokens(_, { code }, context, info){
            
            var data = {
                access_token: "",
                token_type: "",
                expires_in: 0,
                scope: "",
                refresh_token: ""
            }
            
            await axios({
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                params: {
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": REDIRECT_URL
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
                    'Content-Type':'application/x-www-form-urlencoded'
                }
              }).then(function (response) {
                //console.log(response);
                data = response.data
                console.log(data);

                return data
              })
              .catch(function (error) {
                console.log(error);
                return {
                    access_token: "",
                    token_type: "",
                    expires_in: 0,
                    scope: "",
                    refresh_token: ""
                }
              });
            
            return data
        },
        async refreshAccessTokenCall(_, { refreshToken }, context, info){
            
            var data = {
                access_token: "",
                token_type: "",
                expires_in: 0,
                scope: ""
            }
            
            await axios({
                method: 'post',
                url: 'https://accounts.spotify.com/api/token',
                params: {
                    "grant_type": "refresh_token",
                    "refresh_token": refreshToken
                },
                headers: {
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
                    'Content-Type':'application/x-www-form-urlencoded'
                }
              }).then(function (response) {
                //console.log(response);
                data = response.data
                console.log(data);

                return data
              })
              .catch(function (error) {
                console.log(error);
                return {
                    access_token: "",
                    token_type: "",
                    expires_in: 0,
                    scope: ""
                }
              });
            
            return data
        },
        async getUserProfileAndSetUserToDatabase(_, { access_token }, context, info){
            var data = {
                country: "",
                display_name: "",
                email: "",
                href: "",
                spotify_id: ""
            }

            await axios({
                method: 'get',
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type':'application/x-www-form-urlencoded'
                }
              }).then(async function (response) {
                //console.log(response);
                //const {country, display_name, email, href, id} = response;
                const newdata = response.data
                data = {
                  country: newdata.country,
                  display_name: newdata.display_name,
                  email: newdata.email,
                  href: newdata.href,
                  spotify_id: newdata.id
                }
                console.log(data);

                const newUser = new User({
                    country: data.country,
                    display_name: data.display_name,
                    email: data.email,
                    href: data.href,
                    spotify_id: data.spotify_id
                })

                const user = await User.findOne({ spotify_id: data.spotify_id })
                if(!user)
                {
                    const res = await newUser.save();
                    console.log(res._doc);
                    return res
                }
                else
                {
                    data = {
                      country: "",
                      display_name: "",
                      email: "",
                      href: "",
                      spotify_id: ""
                  }
                  throw new UserInputError("User already exists")
                  //return data
                }
              })
              .catch(function (error) {
                console.log(error);
                return {
                    country: "",
                    display_name: "",
                    email: "",
                    href: "",
                    spotify_id: ""
                }
              });

            return data
        },
        async getUserProfile(_, { access_token }, context, info){
            var data = {
                country: "",
                display_name: "",
                email: "",
                href: "",
                spotify_id: ""
            }

            await axios({
                method: 'get',
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type':'application/x-www-form-urlencoded'
                }
              }).then(async function (response) {
                //console.log(response);
                //const {country, display_name, email, href, id} = response;
                const newdata = response.data
                data = {
                  country: newdata.country,
                  display_name: newdata.display_name,
                  email: newdata.email,
                  href: newdata.href,
                  spotify_id: newdata.id
                }
                console.log(data);

                return data
              })
              .catch(function (error) {
                console.log(error);
                return {
                    country: "",
                    display_name: "",
                    email: "",
                    href: "",
                    spotify_id: ""
                }
              });
            
            return data
        }
    }
}