const { SlashCommandBuilder, PermissionsBitField, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags, AllowedMentionsTypes } = require("discord.js");

const db = require('../fonctions/database.js');

module.exports = {
    name: "sanctionlist",
    description: "🛠️ Affiche la liste des sanctions.",
    aliases: ["sanction-list", "list-sanctions", "listsanctions", "listsanction", "sanctionslist", "sanctions-list", "warn-list", "warnlist", "list-warns", "listwarns", "listwarn", "warnslist", "warns-list"],
    permissions: [PermissionsBitField.Flags.MuteMembers],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const userId = args[0] ? args[0].replace(/[<@!>]/g, '') : null;
        if (args[0] && !userId) {
            return message.reply("<:X_:1454545141397327903> Merci de fournir un ID utilisateur valide.");
        }
        const title = `**Liste des sanctions pour ${userId ? `<@${userId}>` : `le serveur ${message.guild.name}`} :**`;
        let text = "";
        let sanction = [];

        try {
            if (!args[0]) {
                sanction = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM sanctions WHERE guildId = ?`, [message.guild.id], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows || []);
                    });
                });
                if (!sanction || sanction.length === 0) {
                    return message.reply("<:X_:1454545141397327903> Il n'y a aucune sanction dans ce serveur.");
                }
            } else {
                sanction = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [message.guild.id, userId], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows || []);
                    });
                });
                if (!sanction || sanction.length === 0) {
                    return message.reply("<:X_:1454545141397327903> Il n'y a aucune sanction pour cet utilisateur.");
                }
            }
        } catch (err) {
            console.error(err);
            return message.reply("<:X_:1454545141397327903> Une erreur est survenue lors de la récupération des sanctions.");
        }

        // ensure we have an array before sorting
        if (!Array.isArray(sanction)) sanction = [];
        sanction.sort((a, b) => new Date(b.date) - new Date(a.date));

        while (true) {
            for (let i = 0; i < Math.min(sanction.length, 10); i++) {
                const row = sanction[i];
                text += `\n**${i + 1}.** <@${row.userId}> - ${row.reason} - ${row.date}`;
            }

            const components = [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(title)
                ),
                new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(text)
                )
            ];

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
            text = "";
            sanction.splice(0, 10);
            if (sanction.length === 0) break;
        }
    },

    async executeSlash(client, interaction) {
        const userId = interaction.options.getUser('user') ? interaction.options.getUser('user').id : null;
        if (interaction.options.getUser('user') && !userId) {
            return interaction.reply({ content: "<:X_:1454545141397327903> Merci de fournir un ID utilisateur valide.", flags: 64 });
        }
        const title = `**Liste des sanctions pour ${userId ? `<@${userId}>` : `le serveur ${interaction.guild.name}`} :**`;
        let text = "";
        let sanction = [];
        try {
            // interaction.options.getUser was used to build userId above; check presence the same way
            if (!interaction.options.getUser('user')) {
                sanction = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM sanctions WHERE guildId = ?`, [interaction.guild.id], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows || []);
                    });
                });
                if (!sanction || sanction.length === 0) {
                    return interaction.reply({ content: "<:X_:1454545141397327903> Il n'y a aucune sanction dans ce serveur.", flags: 64 });
                }
            } else {
                sanction = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [interaction.guild.id, userId], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows || []);
                    });
                });
                if (!sanction || sanction.length === 0) {
                    return interaction.reply({ content: "<:X_:1454545141397327903> Il n'y a aucune sanction pour cet utilisateur.", flags: 64 });
                }
            }
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "<:X_:1454545141397327903> Une erreur est survenue lors de la récupération des sanctions.", flags: 64 });
        }

        if (!Array.isArray(sanction)) sanction = [];
        sanction.sort((a, b) => new Date(b.date) - new Date(a.date));
        while (true) {
            for (let i = 0; i < Math.min(sanction.length, 10); i++) {
                const row = sanction[i];
                text += `\n**${i + 1}.** <@${row.userId}> - ${row.reason} - ${row.date}`;
            }
            const components = [
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(title)
                ),
                new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(text)
                )
            ];
            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } });
            text = "";
            sanction.splice(0, 10);
            if (sanction.length === 0) break;
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('ID de l\'utilisateur (optionnel)')
            );
    }
};