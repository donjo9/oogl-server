import { ApolloServer, gql } from "apollo-server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
})();

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
    name: String
    tag: String
  }

  input AddPlayerPayload {
    userid: String
    teamid: String
  }

  type Query {
    me(id: String): User
    team(id: String): Team
    teams: [Team]!
  }

  type Mutation {
    signup(data: SignUpPayLoad): AuthRespons
    createTeam(data: CreateTeamPayload): Team
    addPlayer(data: AddPlayerPayload): Team
  }
`;

const resolvers = {
  User: {
    team: async (parent) => {
      const sql =
        "SELECT teams.* FROM teams JOIN player_team_realation ptr ON teams.id = ptr.teamId AND ptr.playerId = (?);";
      const team = await db.get(sql, parent.id);
      return team;
    },
  },
  Team: {
    players: async (parent) => {
      const sql =
        "SELECT users.* FROM users JOIN player_team_realation ptr ON users.id = ptr.playerId AND ptr.teamId = (?);";
      const player = await db.all(sql, parent.id);
      return player;
    },
  },
  Query: {
    me: async (parent, { id }, context, info) => {
      const sql = "SELECT id, username from users WHERE id=(?);";
      const user = await db.get(sql, id);
      return user;
    },
    teams: async () => {
      const sql = "SELECT id, name, tag FROM teams;";
      const t = await db.all(sql);
      return t;
    },
    team: async (parent, { id }) => {
      const sql = "SELECT id, name, tag FROM teams WHERE id=(?)";
      const team = await db.get(sql, [id]);
      return team;
    },
  },
  Mutation: {
    signup: async (parent, { data }, context, info) => {
      const { username, password, email } = data;
      const hash = await bcrypt.hash(password, 10);
      const id = nanoid();
      const res = await db.run(
        "INSERT INTO users (id, username, password, email) VALUES(?,?,?,?)",
        [id, username, hash, email]
      );
      return { id, token: nanoid() };
    },
    createTeam: async (parent, { data }, context) => {
      const { userid, name, tag } = data;
      const id = nanoid();
      const tSql = "INSERT INTO teams(id,name,tag) VALUES(?,?,?)";
      const rSql =
        "INSERT INTO player_team_realation(playerId,teamId) VALUES(?,?)";
      await db.run(tSql, [id, name, tag]);
      await db.run(rSql, [userid, id]);
      return { id, name, tag };
    },
    addPlayer: async (parent, { data }, context) => {
      const { userid, teamid } = data;
      const rSql =
        "INSERT INTO player_team_realation(playerId,teamId) VALUES(?,?)";
      await db.run(rSql, [userid, teamid]);
      const sql = "SELECT id, name, tag FROM teams WHERE id=(?)";
      const team = await db.get(sql, [teamid]);
      return team;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
