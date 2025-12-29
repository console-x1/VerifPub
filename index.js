const { Client, Collection, GatewayIntentBits, Partials, ActivityType, Routes } = require("discord.js");
const { REST } = require('@discordjs/rest');

const fs = require("fs");
const path = require("path");
const colors = require("colors");
const cron = require("node-cron");

const loggT = require("./loggerT");
const loggE = require("./loggerE");

let client = null;
let config = null;

// ==================================================
// IPC – ordres du core
// ==================================================
process.on("message", msg => {
  if (!msg || !msg.type) return;

  if (msg.type === "INIT") {
    config = msg.config;

    startBot(config);
  }

  if (msg.type === "STOP") {
    console.log(`🛑 STOP reçu (${config?.NAME || "bot"})`.red);
    shutdown();
  }
});

// ==================================================
// MODE LOCAL (sans core)
// ==================================================
if (!process.send) {
  console.log("🧪 Mode local détecté".cyan);

  const botsConfig = require("./bots.json");
  for (const botConfig of botsConfig) {
    config = botConfig;
    startBot(botConfig);
  }
}

// ==================================================
// BOT DISCORD
// ==================================================
function startBot(botConfig) {
  if (client) return;

  client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials),
    presence: {
      activities: [{
        name: botConfig.activity || "En ligne…",
        type: ActivityType.Custom,
      }],
    },
    allowedMentions: { parse: ["roles", "users"], repliedUser: false }
  });

  client.config = botConfig;
  client.commands = new Collection();

  // COMMANDES
  const commands = []
  const commandsPath = path.join(__dirname, "commands");
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.name, command);
    if (command.data) commands.push(command.data.toJSON())
  }

  const rest = new REST({ version: '10' }).setToken(botConfig.token);

  rest.put(
    Routes.applicationCommands(botConfig.id), { body: commands }
  ).catch(console.error);

  // EVENTS
  const eventsPath = path.join(__dirname, "events");
  for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
    const event = require(path.join(eventsPath, file));
    event.once
      ? client.once(event.name, (...args) => event.execute(client, ...args))
      : client.on(event.name, (...args) => event.execute(client, ...args));
  }

  client.login(botConfig.token)
    .then(() => {
      process.send?.({ type: "READY", id: botConfig.id });
      startCron()
    })
    .catch(err => {
      console.error(`❌ Connexion ${botConfig.NAME} : ${err.message}`.red);
      shutdown(2);
    });
}

// ==================================================
// CRON (host uniquement)
// ==================================================
function startCron() {
  const backupDir = path.join(__dirname, "backup");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  cron.schedule("0 */6 * * *", () => backupJson("pubs.json", "pubs"));
  cron.schedule("5 */12 * * *", () => backupJson("anti-self.json", "anti-self"));
}

function backupJson(file, prefix) {
  const src = path.join(__dirname, file);
  if (!fs.existsSync(src)) return;

  const date = new Date().toISOString();
  const dest = path.join(__dirname, "backup", `${prefix}-${date}.json`);

  fs.copyFileSync(src, dest);
  cleanOldBackups(prefix);
}

function cleanOldBackups(prefix) {
  const backupDir = path.join(__dirname, "backup");
  const now = Date.now();

  for (const file of fs.readdirSync(backupDir)) {
    if (!file.startsWith(prefix)) continue;

    const full = path.join(backupDir, file);
    const ageDays = (now - fs.statSync(full).mtimeMs) / 86400000;
    if (ageDays > 15) fs.unlinkSync(full);
  }
}

// ==================================================
// SHUTDOWN
// ==================================================
function shutdown(code = 0) {
  try {
    client?.destroy();
  } catch { }
  process.exit(code);
}

// ==========================
// ANTI-CRASH
// ==========================
process.on("unhandledRejection", (error) => {
  loggE(error)
  if (error.code == 10062) return; // Unknown Interaction
  if (error.code == 10008) return; // Unknown Message
  if (error.code == 10003) return; // Unknown Channel
  if (error.code == 50007) return; // Cannot send messages to this user
  if (error.code == 50013) return; // Missing Permission
  if (error.code == 10026) return; // Unknown Ban -> membre non banni
  if (error.code == 40060) return; // Interaction has already been acknowledged.
  console.log(`[ERROR] ${error}\n[ERROR.CODE] : ${error.code}\n`.red);
})

process.on("exit", (code) => {
  if (code == "10064") return;
  if (code == "10008") return;
  if (code == "10062") return;
  loggE(`[antiCrash] :: Exit\n[ERROR.CODE] : ${code}\n`)
  console.log(" [antiCrash] :: Exit".red);
  console.log("Code de sortie:", code);
  return
});