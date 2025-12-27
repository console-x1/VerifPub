const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");

const db = require("../fonctions/database.js");

function createConfigComponents(guild, client) {
    return [
        new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Configuration:"),
        new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("<a:verifyyellow:1454545148510732369>・Enregistrement de l'auto embed a été correctement effectué."),
        )
    ];
}

module.exports = {
    name: "config_auto-embed",
    description: "🛠️ configuration de l'auto embed",
    aliases: [],
    permissions: [PermissionsBitField.Flags.Administrator],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        const components = [
            new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Configuration:"),
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("<a:verifyyellow:1454545148510732369>・Utilisez la commande en slash pour configurer l'auto embed."),
            )
        ]
        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
    },

    async executeSlash(client, interaction) {
        const donnee = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE userId =?`, [interaction.user.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        const color = interaction.options.getString("couleur") ?? client.config.color;

        db.run(
            `UPDATE autoembeds SET status = ?, titre = ?, description = ?, color = ? WHERE guildId = ?`,
            [
                interaction.options.getString("status"),
                interaction.options.getString("titre"),
                interaction.options.getString("description"),
                color,
                interaction.guild.id
            ]
        );

        const components = createConfigComponents(interaction.guild, client);
        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option
                    .setName("status")
                    .setDescription("systeme activé ou non.")
                    .addChoices(
                        { name: "actif", value: "true" },
                        { name: "inactif", value: "false" }
                    )
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("titre")
                    .setDescription("posibilité d'utiliser {member.tag}.")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("description")
                    .setDescription("contenu de l'embed (; = saut de ligne).")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName("couleur")
                    .setDescription("couleur de l'embed en HEXADECIMAL.")
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    }
};