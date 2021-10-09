const partiesResolvers = require('./parties');
const usersResolvers = require('./users');

module.exports = {
    Query: {
        ...partiesResolvers.Query,
        ...usersResolvers.Query,
        ...partiesResolvers.Mutation,
        ...usersResolvers.Mutation
    }
}