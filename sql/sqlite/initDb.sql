DROP TABLE users;
CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    username text UNIQUE NOT NULL,
    password text NOT NULL,
    email text UNIQUE NOT NULL
);

DROP TABLE teams;
CREATE TABLE IF NOT EXISTS teams ( 
    id text PRIMARY KEY,
    name text UNIQUE NOT NULL,
    tag text UNIQUE NOT NULL
);

DROP TABLE player_team_realation;
CREATE TABLE IF NOT EXISTS player_team_realation ( 
    id integer PRIMARY KEY,
    playerId text UNIQUE NOT NULL,
    teamId text NOT NULL,
    FOREIGN KEY (playerId) REFERENCES users (id)
    FOREIGN KEY (teamId) REFERENCES teams (id)
);