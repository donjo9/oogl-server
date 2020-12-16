import Dataloader from "dataloader";
import { db } from "./db.js";

const getBatchTeamPlayers = async (teamIds) => {
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

export const teamPlayerLoader = new Dataloader((teamIds) =>
  getBatchTeamPlayers(teamIds)
);
);
