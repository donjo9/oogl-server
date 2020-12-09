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
  createTeamInvitation: async (parent, { data }, context) => {
    try {
      const { playerid, teamid } = data;
      const sql =
        "INSERT INTO team_invitations(id, playerid, teamid) VALUES(?,?,?)";
      const values = [nanoid(), playerid, teamid];
      await db.run(sql, values);
      return true;
    } catch (error) {
      throw new Error("Wrong player and/or teamid, please try again!");
    }
  },
  acceptTeamInvitation: async (parent, { data }, context) => {
    const { invitationid } = data;
    const iSql = "SELECT playerId, teamId from team_invitations WHERE id = (?)";
    const invite = await db.get(iSql, [invitationid]);
    if (invite) {
      const rSql =
        "INSERT INTO player_team_realation(playerId,teamId) VALUES(?,?)";
      await db.run(rSql, [invite.playerId, invite.teamId]);
      const sSql = "SELECT id, name, tag FROM teams WHERE id=(?)";
      const team = await db.get(sSql, [invite.teamId]);
      const dSql = "DELETE FROM team_invitations WHERE id = (?)";
      await db.run(dSql, invitationid);
      return team;
    } else {
      throw new Error("No invitation with that id");
    }
  },
  createGameChallenge: async (parent, { data }, context, info) => {
    const { challengerId, defenderId } = data;
    const sql =
      "INSERT INTO game_challenges(challenging_team, defending_team) VALUES(?,?);";
    const result = await db.run(sql, [challengerId, defenderId]);
    return { id: result.lastID, challengerId, defenderId };
  },
};
