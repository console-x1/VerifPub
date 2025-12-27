const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const loggT = require('./loggerT');

// Charger tous les bots
const botsConfig = require("./bots.json");

// Charger toutes les commandes une seule fois
const commands = [];
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith(".js"));
commandFiles.forEach(commandFile => {
    const command = require(`${__dirname}/commands/${commandFile}`);
    if (command.data) commands.push(command.data.toJSON());
});

// Déployer pour chaque bot
(async () => {
    for (const bot of botsConfig) {
        const rest = new REST({ version: '10' }).setToken(bot.token);
        try {
            const data = await rest.put(
                Routes.applicationCommands(bot.id),
                { body: commands }
            );
            loggT(`✅ ${data.length} commandes déployées pour ${bot.NAME}`);
            console.log(`✅ ${data.length} commandes déployées pour ${bot.NAME}`);
        } catch (err) {
            console.error(`❌ Erreur déploiement ${bot.NAME} :`, err);
        }
    }
})();
