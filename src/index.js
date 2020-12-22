import { ApolloServer } from "apollo-server";

import { typeDefs } from "./typeDefs.js";

import { Mutation } from "./mutations.js";
import { Query, User, Team, Game, GameTeam } from "./querys.js";

const resolvers = {
  Query,
  User,
  Team,
  Game,
  GameTeam,
  Mutation,
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
