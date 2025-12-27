const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path")
const colors = require("colors");
const cron = require('node-cron');
var loggT = require('./loggerT.js');
var loggE = require('./loggerE.js');

// Charger la config de tous les bots
const botsConfig = require("./bots.json");

// Charger events et commandes une seule fois
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

function createBot(config) {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping,
            GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User],
        presence: {
            activities: [{
                name: config.activity || "En ligne...",
                type: ActivityType.Custom,
            }],
        },
        allowedMentions: { parse: ["roles", "users"], repliedUser: false }
    });

    client.config = config;
    client.commands = new Collection();

    // Commandes
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }

    // Events
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }

    // Connexion
    client.login(config.token)
        .then(() => console.log(`✅ ${config.NAME} connecté`.green))
        .catch(async err => {
            if (err.message == "getaddrinfo ENOTFOUND gateway.discord.gg") {
                console.log(`⚠️ Problème de connexion internet. Nouvelle tentative dans 30 secondes...`.yellow)
                await new Promise(resolve => setTimeout(resolve, 30000));
                createBot(config);
            } else {
                console.error(`❌ Erreur connexion ${config.NAME} : ${err.message}`.red);
            }
        });
}

// Lancer tous les bots
for (const botConfig of botsConfig) {
    createBot(botConfig);
}

// gestion des erreurs
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

cron.schedule('0 */6 * * *', async () => {
    const dbPath = path.join(__dirname, 'pubs.json');
    const backupDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    const date = new Date();
    const dateString = date.toISOString();
    const backupPath = path.join(backupDir, `pubs-${dateString}.json`);
    fs.copyFile(dbPath, backupPath, (err) => {
        if (err) {
            console.error(`[BACKUP] Erreur lors du backup de la base de données :`.red, err);
        } else {
            console.log(`[BACKUP] Sauvegarde créée : ${backupPath}`.green);
        }
    });

    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error(`[BACKUP] Erreur lors de la lecture du dossier backup :`.red, err);
            return;
        }
        files.forEach(file => {
            const match = file.match(/^pubs-(\d{4}-\d{2}-\d{2})$/);
            if (match) {
                const fileDate = new Date(match[1]);
                const now = new Date();
                const diffTime = now - fileDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays > 15) {
                    const filePath = path.join(backupDir, file);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`[BACKUP] Erreur lors de la suppression d'une backup (${filePath}) :`.red, err);
                        } else {
                            console.log(`[BACKUP] Backup supprimé (plus de 2 semaines) : ${filePath}`.yellow);
                        }
                    });
                }
            }
        });
    });
});

cron.schedule('5 */12 * * *', async () => {
    const dbPath = path.join(__dirname, 'anti-self.json');
    const backupDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }
    const date = new Date();
    const dateString = date.toISOString();
    const backupPath = path.join(backupDir, `anti-self-${dateString}.json`);
    fs.copyFile(dbPath, backupPath, (err) => {
        if (err) {
            console.error(`[BACKUP] Erreur lors du backup de la base de données :`.red, err);
        } else {
            console.log(`[BACKUP] Sauvegarde créée : ${backupPath}`.green);
        }
    });

    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error(`[BACKUP] Erreur lors de la lecture du dossier backup :`.red, err);
            return;
        }
        files.forEach(file => {
            const match = file.match(/^pubs-(\d{4}-\d{2}-\d{2})$/);
            if (match) {
                const fileDate = new Date(match[1]);
                const now = new Date();
                const diffTime = now - fileDate;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays > 15) {
                    const filePath = path.join(backupDir, file);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`[BACKUP] Erreur lors de la suppression d'une backup (${filePath}) :`.red, err);
                        } else {
                            console.log(`[BACKUP] Backup supprimé (plus de 2 semaines) : ${filePath}`.yellow);
                        }
                    });
                }
            }
        });
    });
});