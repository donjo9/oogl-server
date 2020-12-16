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

const getBatchTeamGames = async (teamIds) => {
  const placeholder = teamIds.map(() => "?").join(",");
  const sql = `SELECT * FROM games WHERE challenging_team IN (${placeholder}) OR defending_team IN (${placeholder})`;
  const rows = await db.all(sql, [...teamIds, ...teamIds]);
  if (rows) {
    let mappedInput = {};
    rows.forEach((r) => {
      if (mappedInput[r.challenging_team]) {
        mappedInput[r.challenging_team].push({
          id: r.id,
          challenging_team: r.challenging_team,
          defending_team: r.defending_team,
          challenging_score: r.challenging_score,
          defending_score: r.defending_score,
          game_status: r.game_staus,
        });
      } else {
        mappedInput[r.challenging_team] = [];
        mappedInput[r.challenging_team].push({
          id: r.id,
          challenging_team: r.challenging_team,
          defending_team: r.defending_team,
          challenging_score: r.challenging_score,
          defending_score: r.defending_score,
          game_status: r.game_staus,
        });
      }

      if (mappedInput[r.defending_team]) {
        mappedInput[r.defending_team].push({
          id: r.id,
          challenging_team: r.challenging_team,
          defending_team: r.defending_team,
          challenging_score: r.challenging_score,
          defending_score: r.defending_score,
          game_status: r.game_staus,
        });
      } else {
        mappedInput[r.defending_team] = [];
        mappedInput[r.defending_team].push({
          id: r.id,
          challenging_team: r.challenging_team,
          defending_team: r.defending_team,
          challenging_score: r.challenging_score,
          defending_score: r.defending_score,
          game_status: r.game_staus,
        });
      }
    });
    const games = teamIds.map((teamIds) => {
      if (mappedInput[teamIds]) {
        return mappedInput[teamIds];
      }
      return [];
    });
    return games;
  }
  return [];
};

const getBatchGameTeams = async (teamIds) => {
  console.log(teamIds);
  const placeholder = teamIds.map(() => "?").join(",");
  const sql = `SELECT * FROM teams WHERE id in (${placeholder})`;
  const rows = await db.all(sql, teamIds);
  if (rows) {
    const mappedInput = {};
    rows.map((r) => {
      if (!mappedInput[r.id]) {
        mappedInput[r.id] = {
          id: r.id,
          name: r.name,
          tag: r.tag,
        };
      }
    });
    const teams = teamIds.map((id) => mappedInput[id]);
    return teams;
  }
  return [];
};

export const teamPlayerLoader = new Dataloader((teamIds) =>
  getBatchTeamPlayers(teamIds)
);

export const teamGamesLoader = new Dataloader((teamIds) =>
  getBatchTeamGames(teamIds)
);

export const gameTeamsLoader = new Dataloader((teamIds) =>
  getBatchGameTeams(teamIds)
);
