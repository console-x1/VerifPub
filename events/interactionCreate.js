var loggT = require('../loggerT.js');
var loggE = require('../loggerE.js');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {

        if (!interaction.guild) return;
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Fonction utilitaire pour embed de permissions
            function embedPerm(texte) {
                let embedNoPerm = new EmbedBuilder()
                    .setTitle('<:warning:1454545145650479382> **__PERMISSION MANQUANTE__** <:warning:1454545145650479382>')
                    .setDescription(texte)
                    .setImage("https://tenor.com/bmZ5y.gif")
                    .setColor(client.config.color);
                interaction.reply({ embeds: [embedNoPerm] });
            }

            // vérification des permissions
            if (command.permissions) {
                const isServerOwner = interaction.guild.ownerId !== interaction.user.id
                const isDeveloper = client.config.owners.includes(interaction.user.id);
                const authorPerms = interaction.guild.channels.cache.get(interaction.channelId).permissionsFor(interaction.user);

                if (command.botOwnerOnly && !isDeveloper) return embedPerm(`<:warning:1454545145650479382> **Vous devez être le propriétaire du bot pour exécuter cette commande.**`);
                if (command.guildOwnerOnly && isServerOwner && !isDeveloper) return embedPerm(`<:warning:1454545145650479382> **Vous devez être le propriétaire du serveur pour exécuter cette commande.**`);
                if ((!authorPerms || !authorPerms.has(command.permissions)) && !isDeveloper && !isServerOwner) return embedPerm(`<:warning:1454545145650479382> **Vous n'avez pas les permissions nécessaires pour exécuter cette commande.** ||${command.permissions}||`);
                
                command.executeSlash(client, interaction).catch((error) => { loggE(error), console.log(`${error}`.red), console.log('code erreur : ' + error.code) });
                loggT(`[CMD-S]  ${interaction.guild.name} | ${interaction.channel.name} | ${interaction.user.tag} | ${command.name}`);
                console.log(`[CMD-S]  ${interaction.guild.name} | ${interaction.channel.name} | ${interaction.user.tag} | ${command.name}`.grey);
                return;
            } else {
                command.executeSlash(client, interaction).catch((error) => { loggE(error), console.log(`${error}`.red), console.log('code erreur : ' + error.code) });
                loggT(`[CMD-S]  ${interaction.guild.name} | ${interaction.channel.name} | ${interaction.user.tag} | ${command.name}`);
                console.log(`[CMD-S]  ${interaction.guild.name} | ${interaction.channel.name} | ${interaction.user.tag} | ${command.name}`.grey);
            }
        }
    }
}