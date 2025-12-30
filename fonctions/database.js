const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const botId = process.env.BOT_ID || "default";

const baseDir = path.resolve(__dirname, "../", "database");
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const dbPath = path.join(baseDir, botId + ".sqlite");
const db = new sqlite3.Database(dbPath);

const ready = new Promise((resolve, reject) => {
  db.serialize(() => {
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
    )`, err => {
      if (err) reject(err);
      else resolve();
    });
  });
});

db.ready = ready;
module.exports = db;