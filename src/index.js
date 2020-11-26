import { ApolloServer, gql } from "apollo-server";
import { nanoid } from "nanoid";

const typeDefs = gql`
  type User {
    username: String
  }
  type Query {
    me: User!
  }
`;
const users = [
  {
    username: "JC",
  },
  {
    username: "Misfly",
  },
];
const resolvers = {
  Query: {
    me: () => users[0],
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
