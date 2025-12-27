const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./db.sqlite");

db.run(`CREATE TABLE IF NOT EXISTS guilds (
  guildId TEXT,
  logschannel TEXT,
  sanctionchannel TEXT,
  verifchannel TEXT,
  PRIMARY KEY (guildId)
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
  guildId TEXT,
  userId TEXT,
  lb INTEGER DEFAULT 0,
  PRIMARY KEY (guildId, userId)
)`);

db.run(`CREATE TABLE IF NOT EXISTS sanctions (
  guildId TEXT,
  userId TEXT,
  reason TEXT,
  date TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS autoembeds (
  guildId TEXT,
  status TEXT,
  titre TEXT,
  description TEXT,
  color TEXT,
  PRIMARY KEY (guildId)
)`);

db.run(`CREATE TABLE IF NOT EXISTS pubchannel (
  guildId TEXT,
  id TEXT,
  status INTEGER DEFAULT 0,
  PRIMARY KEY (guildId, id)
)`);

module.exports = db;