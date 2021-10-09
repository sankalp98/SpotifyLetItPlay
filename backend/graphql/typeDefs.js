const { gql } = require('apollo-server');

module.exports = gql `
    type Query{
        getParties: [Party]
        getURLForAuthentication: URL!
        exchangeCodeForAccessAndRefreshTokens(code: String!): tokenData!
        refreshAccessTokenCall(refreshToken: String!): AccessTokenData!
        getUserProfileAndSetUserToDatabase(access_token: String!): User!
        getUserProfile(access_token: String!): User!
        createParty(theme: String!, access_token: String!, spotify_id: String!): Party!
        deleteParty(partyId: String!, spotify_id: String!): String!
        joinParty(partyId: String!, access_token: String!, spotify_id: String!): Party!
        leaveParty(partyId: String!, access_token: String!, spotify_id: String!): String!
        printUsersTopTracksOrArtists(access_token: String!, spotify_id: String!): String!
    }
    type AccessTokenData{
        access_token: String!
        token_type: String!
        expires_in: Int!
        scope: String!
    }
    type User{
        country: String!,
        display_name: String!,
        email: String!,
        href: String!,
        spotify_id: String!
    }
    type URL{
        url: String!
    }
    type tokenData{
        access_token: String!
        token_type: String!
        expires_in: Int!
        scope: String!
        refresh_token: String!
    }
    type Party{
        partyId: String!
        hostId: String!
        theme: String!
        playlistId: String!
        members: [User]!
        host: User!
    }
`