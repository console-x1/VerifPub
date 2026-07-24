const { Client, Collection, GatewayIntentBits, Partials, ActivityType, Routes } = require("discord.js");
const { REST } = require('@discordjs/rest');

const db = require("./fonctions/database");

const fs = require("fs");
const path = require("path");
const colors = require("colors");
const cron = require("node-cron");

const loggT = require("./loggerT");
const loggE = require("./loggerE");

let client = null;
let config = null;
let cronStarted = false;

// ==================================================
// IPC – ordres du core
// ==================================================
process.on("message", async msg => {
  if (!msg || !msg.type) return;

  if (msg.type === "INIT") {
    config = msg.config;

    await db.ready;

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
      if (!cronStarted) {
        cronStarted = true;
        startCron()
      }
    })
    .catch(err => {
      console.error(`❌ Connexion ${botConfig.NAME} : ${err.message}`.red);
      shutdown(2);
    });
}

// ==================================================
// CRON (host uniquement)
// ==================================================
const BACKUP_SERVER_URL = "http://node-3.unixsys.tech:2026/v1/backups/upload";
const CLIENT_TOKEN = "2dac1cc25b4e93fc39a92fb7f85e9f66b13fb322e08e790e";

function startCron() {
  cron.schedule("0 */6 * * *", () => backupJson("pubs.json", "pubs"));
  cron.schedule("5 */24 * * *", () => backupJson("anti-self.json", "anti-self"));
}

async function backupJson(file, prefix) {
  const src = path.join(__dirname, file);
  
  if (!fs.existsSync(src)) {
    console.error(`⚠️ Fichier ${file} introuvable, backup annulé.`);
    return;
  }

  const date = new Date().toISOString().replace(/:/g, '-'); // Remplacer les ':' pour éviter les soucis Windows/Linux
  const fileName = `${prefix}-${date}.json`;

  try {
    const fileBuffer = fs.readFileSync(src);
    const blob = new Blob([fileBuffer], { type: 'application/json' });
    
    const formData = new FormData();
    formData.append("file", blob, fileName);

    const response = await fetch(BACKUP_SERVER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLIENT_TOKEN}`
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Échec de l'upload distant pour ${fileName} :`, err);
    } else {
      console.log(`✅ Sauvegarde distante réussie : ${fileName}`);
    }
  } catch (error) {
    console.error(`❌ Erreur réseau lors de la sauvegarde de ${fileName} :`, error);
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