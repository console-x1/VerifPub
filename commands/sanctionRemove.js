const { SlashCommandBuilder, PermissionsBitField, TextDisplayBuilder, ContainerBuilder, ActionRowBuilder, MessageFlags, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");

const db = require('../fonctions/database.js');

const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

async function reply(content, event) {
    const components = [
        new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(content)
        )
    ];
    await event.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
}

module.exports = {
    name: "retirer-sanction",
    description: "🛠️ Retire une sanction à un utilisateur.",
    aliases: ["remove-sanction", "unsanction", "unsanction-user", "unwarn", "removesanction"],
    permissions: [PermissionsBitField.Flags.MuteMembers],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const userId = args[0] ? args[0].replace(/[<@!>]/g, '') : null;
        if (!userId) {
            return message.reply("<:X_:1454545141397327903> Merci de fournir un ID utilisateur valide.");
        }
        const sanctionList = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [message.guild.id, userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });

        if (sanctionList.length > 0) {
            const options = sanctionList.map((sanction, index) => {
                return {
                    label: `${index + 1}. ${sanction.reason}`,
                    value: sanction.date,
                    description: `Sanction ID: ${sanction.date}`,
                };
            });



            const container = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Liste des sanctions pour <@${userId}> :**\n\nVeuillez sélectionner la sanction à retirer dans le menu ci-dessous.`)
            ).addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`sanction_delete_${userId}`)
                        .setPlaceholder('Sélectionnez une sanction à retirer')
                        .addOptions(options)
                )
            );

            await message.reply({ components: [container], flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
        } else {
            reply('<:X_:1454545141397327903> Aucune sanction pour cet utilisateur.', message);
        }
    },

    async executeSlash(client, interaction) {
        const userId = interaction.options.getUser('user')?.id;

        const sanctionList = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [interaction.guild.id, userId], (err, rows) => {
                if (err) {
                    console.error(err);
                    return reply("<:X_:1454545141397327903> Une erreur est survenue lors de la récupération des sanctions.", interaction);
                }
                resolve(rows || []);
            });
        });

        if (sanctionList.length > 0) {
            const options = sanctionList.map((sanction, index) => {
                return {
                    label: `${index + 1}. ${sanction.reason} - ${sanction.date}`,
                    value: sanction.date,
                    description: `Sanction ID: ${sanction.date}`,
                };
            });



            const container = new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Liste des sanctions pour <@${userId}> :**\n\nVeuillez sélectionner la sanction à retirer dans le menu ci-dessous.`)
            ).addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`sanction_remove_${userId}`)
                        .setPlaceholder('Sélectionnez une sanction à retirer')
                        .addOptions(options)
                )
            );

            await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } }).catch(() => { });
        } else {
            reply(':X_:1454545141397327903> Aucune sanction pour cet utilisateur.', interaction);
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionsBitField.Flags.MuteMembers)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('ID de l\'utilisateur')
                    .setRequired(true)
            )
    }
};