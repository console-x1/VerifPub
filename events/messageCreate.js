var loggT = require('../loggerT.js');
var loggE = require('../loggerE.js');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageCreate",
    async execute(client, message) {

        if (message.channel.isDMBased() || message.author.bot) return;
        if (!message.content.startsWith(client.config.prefix)) return;

        // ANALYSEUR DE COMMANDES
        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // check commande
        const command = client.commands.get(commandName) || client.commands.find(command => command.aliases && command.aliases.includes(commandName));
        if (!command) return;

        // check permissions
        function embedPerm(texte) {
            let embedNoPerm = new EmbedBuilder()
                .setTitle('<:warning:1454545145650479382> **__PERMISSION MANQUANTE__** <:warning:1454545145650479382>')
                .setDescription(texte)
                .setImage("https://tenor.com/bmZ5y.gif")
                .setColor(client.config.color);
            message.reply({ embeds: [embedNoPerm] });
        }

        // vérification des permissions
        if (command.permissions) {
            const isServerOwner = message.guild.ownerId !== message.author.id
            const isDeveloper = client.config.owners.includes(message.author.id);
            const authorPerms = message.guild.channels.cache.get(message.channelId).permissionsFor(message.author);

            if (command.botOwnerOnly && !isDeveloper) return embedPerm(`<:warning:1454545145650479382> **Vous devez être le propriétaire du bot pour exécuter cette commande.**`);
            if (command.guildOwnerOnly && isServerOwner && !isDeveloper) return embedPerm(`<:warning:1454545145650479382> **Vous devez être le propriétaire du serveur pour exécuter cette commande. Seul <@${message.guild.ownerId}> peut utiliser cette commande**`);
            if ((!authorPerms || !authorPerms.has(command.permissions)) && !isDeveloper && !isServerOwner) return embedPerm(`<:warning:1454545145650479382> **Vous n'avez pas les permissions nécessaires pour exécuter cette commande.** ||${command.permissions}||`);

            command.execute(client, message, args).catch((error) => { loggE(error), console.log(`${error}`.red), console.log('code erreur : ' + error.code) });
            loggT(`[CMD-MSG] ${message.guild.name} | ${message.channel.name} | ${message.author.tag} | ${command.name}`);
            console.log(`[CMD-MSG] ${message.guild.name} | ${message.channel.name} | ${message.author.tag} | ${command.name}`.yellow);
            return;
        } else {
            command.execute(client, message, args).catch((error) => { loggE(error), console.log(`${error}`.red), console.log('code erreur : ' + error.code) });
            loggT(`[CMD-MSG] ${message.guild.name} | ${message.channel.name} | ${message.author.tag} | ${command.name}`);
            console.log(`[CMD-MSG] ${message.guild.name} | ${message.channel.name} | ${message.author.tag} | ${command.name}`.yellow);
        }
    }
}