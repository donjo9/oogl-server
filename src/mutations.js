import { db } from "./utils/db.js";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export const Mutation = {
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
};
