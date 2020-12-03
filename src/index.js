import { ApolloServer, gql } from "apollo-server";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import Dataloader from "dataloader";

const getBatchPlayers = async (teamIds) => {
  const placeholder = teamIds.map(() => "?").join(",");
  const sql = `SELECT usr.id as uid, usr.username as username, usr.email as email, team.id as tid FROM users usr
    JOIN player_team_realation ptr
      ON usr.id = ptr.playerId
    JOIN teams team
      on ptr.teamId = team.id
    WHERE team.id IN (${placeholder})`;
  const rows = await db.all(sql, teamIds);
  if (rows) {
    let mappedInput = {};
    rows.forEach((r) => {
      if (mappedInput[r.tid] !== undefined) {
        mappedInput[r.tid].push({
          id: r.uid,
          username: r.username,
          email: r.email,
        });
      } else {
        mappedInput[r.tid] = [];
        mappedInput[r.tid].push({
          id: r.uid,
          username: r.username,
          email: r.email,
        });
      }
    });
    const teamArray = teamIds.map((key) => mappedInput[key]);
    return teamArray;
  }
  return [];
};

const teamPlayerLoader = new Dataloader((teamIds) => getBatchPlayers(teamIds));

const players = async (parent) => {
  const players = await teamPlayerLoader.load(parent.id);
  return players;
};

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

  input SignInPayload {
    username: String
    password: String
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
    signin(data: SignInPayload): AuthRespons
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
    players,
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
    signin: async (parent, { data }, context) => {
      const { username, password } = data;
      const sql = "SELECT id, password FROM users WHERE username = (?);";
      const user = await db.get(sql, [username]);
      if (!user) {
        throw new Error("Wrong username and/or password");
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Wrong username and/or password");
      }

      return { id: user.id, token: nanoid() };
    },
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
