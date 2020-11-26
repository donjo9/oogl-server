import { ApolloServer, gql } from "apollo-server";
import { nanoid } from "nanoid";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database.db");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    team: Team
  }

  type Team {
    id: ID!
    name: String!
    tag: String!
    players: [User]
  }

  type AuthRespons {
    id: String
    token: String
  }

  input SignUpPayLoad {
    username: String
    password: String
    email: String
  }

  input CreateTeamPayload {
    userid: String
    teamname: String
    teamtag: String
  }

  input AddPlayerPayload {
    userid: String
  }

  type Query {
    me(id: String): User
    team(id: String): Team
    teams: [Team]!
  }

  type Mutation {
    signup(data: SignUpPayLoad): AuthRespons
    createTeam(data: CreateTeamPayload): Team
    addPlayer(data: AddPlayerPayload): User #Implement this
  }
`;
let users = new Map();
let teams = new Map();

const resolvers = {
  User: {
    team: (parent) => {
      return teams.get(parent.team);
    },
  },
  Team: {
    players: (parent) => {
      console.dir(parent);

      let players = [];
      parent.players.forEach((pId) => players.push(users.get(pId)));

      return players;
    },
  },
  Query: {
    me: (parent, { id }, context, info) => {
      const user = users.get(id);
      return user;
    },
    teams: () => {
      let t = [];
      teams.forEach((team) => {
        t.push({ ...team });
      });
      console.dir(t);
      return t;
    },
    team: (parent, { id }) => {
      const team = teams.get(id);
      return team;
    },
  },
  Mutation: {
    signup: (parent, { data }, context, info) => {
      const { username, password, email } = data;
      const id = nanoid();
      const user = {
        id,
        username,
        password,
        email,
      };

      console.log(
        `User: ${username} with password: ${password} signed up, and got id: ${id}`
      );
      users.set(id, user);
      return { id, token: nanoid() };
    },
    createTeam: (parent, { data }, context) => {
      const { userid, teamname, teamtag } = data;
      const id = nanoid();
      const user = users.get(userid);
      users.set(userid, { ...user, team: id });
      const team = {
        id,
        userid,
        name: teamname,
        tag: teamtag,
        players: [userid],
      };
      teams.set(id, team);
      console.dir(team);
      return team;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
