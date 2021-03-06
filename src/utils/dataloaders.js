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
  const sql = `SELECT g.id, g.game_status, gtr.team FROM games g JOIN game_team_relation gtr ON gtr.team IN (${placeholder})`;
  const rows = await db.all(sql, teamIds);
  if (rows) {
    let mappedInput = {};
    rows.forEach((r) => {
      if (!mappedInput[r.team]) {
        mappedInput[r.team] = [];
        mappedInput[r.team].push({ id: r.id, game_status: r.game_status });
      } else {
        mappedInput[r.team].push({ id: r.id, game_status: r.game_status });
      }
    });
    const games = teamIds.map((teamId) => mappedInput[teamId]);
    return games;
  }
  return [];
};

const getBatchGameTeams = async (gameIds) => {
  const placeholder = gameIds.map(() => "?").join(",");
  const sql = `SELECT * FROM game_team_relation WHERE game in (${placeholder})`;
  const rows = await db.all(sql, gameIds);
  if (rows) {
    const mappedInput = {};
    rows.map((r) => {
      if (!mappedInput[r.game]) {
        mappedInput[r.game] = [];
        mappedInput[r.game].push(r);
      } else {
        mappedInput[r.game].push(r);
      }
    });
    const teams = gameIds.map((id) => mappedInput[id]);
    return teams;
  }
  return [];
};

const getBatchGameTeamsInfo = async (teamIds) => {
  const placeholder = teamIds.map(() => "?").join(",");
  const sql = `SELECT * FROM teams WHERE id in (${placeholder})`;
  const rows = await db.all(sql, teamIds);
  if (rows) {
    const mappedInput = {};
    rows.map((r) => {
      if (!mappedInput[r.id]) {
        mappedInput[r.id] = r;
      }
    });
    const teams = teamIds.map((id) => mappedInput[id]);
    return teams;
  }
  return [];
};

const getBatchChallengeTeams = async (challengeIds) => {
  console.log(challengeIds);
  const placeholder = challengeIds.map(() => "?").join(",");
  const sql = `SELECT t.id as id, t.name, t.tag, gcr.id as gid FROM teams t JOIN game_challenge_relation gcr ON gcr.id IN (${placeholder})`;
  const rows = await db.all(sql, challengeIds);
  const mappedInput = {};
  if (rows) {
    rows.map((r) => {
      if (!mappedInput[r.gid]) {
        mappedInput[r.gid] = [];
        mappedInput[r.gid].push({
          id: r.id,
          name: r.name,
          tag: r.tag,
        });
      } else {
        mappedInput[r.gid].push({
          id: r.id,
          name: r.name,
          tag: r.tag,
        });
      }
    });
    const teams = challengeIds.map((id) => mappedInput[id]);
    return teams;
  }
  return [];
};

const getBatchTeamChallenges = async (teamIds) => {
  console.log(teamIds);
  const placeholder = teamIds.map(() => "?").join(",");
  const sql = `SELECT * FROM game_challenge_relation gcr WHERE team IN (${placeholder})`;
  const rows = await db.all(sql, teamIds);
  const mappedInput = {};
  if (rows) {
    rows.map((r) => {
      if (!mappedInput[r.team]) {
        mappedInput[r.team] = [];
        mappedInput[r.team].push({
          id: r.game_challenge,
        });
      } else {
        mappedInput[r.team].push({
          id: r.game_challenge,
        });
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

export const gameTeamsLoader = new Dataloader((gameIds) =>
  getBatchGameTeams(gameIds)
);

export const gameTeamsInfoLoader = new Dataloader((teamIds) =>
  getBatchGameTeamsInfo(teamIds)
);

export const challengeTeamsLoader = new Dataloader((challengeIds) =>
  getBatchChallengeTeams(challengeIds)
);

export const teamChallengeLoader = new Dataloader((teamId) =>
  getBatchTeamChallenges(teamId)
);
