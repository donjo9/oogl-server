import { db } from "./utils/db.js";
import {
  teamPlayerLoader,
  teamGamesLoader,
  gameTeamsLoader,
  gameTeamsInfoLoader,
} from "./utils/dataloaders.js";

const players = async (parent, data, context) => {
  const players = await teamPlayerLoader.load(parent.id);
  return players;
};

const games = async (parent, args, context) => {
  const games = await teamGamesLoader.load(parent.id);
  return games;
};

const teams = async (parent, args, context) => {
  const teams = await gameTeamsLoader.load(parent.id);
  return teams;
};

const teamInfo = async (parent, args, context) => {
  const team = await gameTeamsInfoLoader.load(parent.team);
  return team;
};

export const User = {
  team: async (parent, data, context) => {
    const sql =
      "SELECT teams.* FROM teams JOIN player_team_realation ptr ON teams.id = ptr.teamId AND ptr.playerId = (?);";
    const team = await db.get(sql, parent.id);
    return team;
  },
};
export const Team = {
  players,
  games,
};

export const Game = {
  teams,
};

export const GameTeam = {
  teamInfo,
};
export const Query = {
  player: async (parent, { id }, context, info) => {
    const sql = "SELECT id, username from users WHERE id=(?);";
    const user = await db.get(sql, id);

    return user;
  },
  players: async (parent, args, context, info) => {
    const sql = "SELECT id, username FROM users";
    const users = await db.all(sql);
    return users || [];
  },
  teams: async (parent, args, context) => {
    const sql = "SELECT id, name, tag FROM teams;";
    const t = await db.all(sql);
    return t;
  },
  team: async (parent, { id }, context) => {
    const sql = "SELECT id, name, tag FROM teams WHERE id=(?)";
    const team = await db.get(sql, [id]);
    return team;
  },
  game: async (parent, { id }, context, info) => {
    const sql = "SELECT * FROM games WHERE id=(?)";
    const game = await db.get(sql, [id]);
    return game;
  },
  games: async () => {
    const sql = `SELECT * FROM games`;
    return await db.all(sql);
  },
};
