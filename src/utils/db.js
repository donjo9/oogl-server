import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbOpen = async () => {
  return await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });
};

export const db = await dbOpen();
