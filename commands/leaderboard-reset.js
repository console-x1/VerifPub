const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "lb-reset",
    description: "📜 Permet de reinitialiser les points publicitaires (leaderboard)",
    aliases: ["leaderboard-reset"],
    permissions: [PermissionsBitField.Flags.Administrator],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        db.run(`UPDATE users SET lb = 0 WHERE guildId = ${message.guild.id}`);

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("<a:verifyyellow:1454545148510732369>・Le leaderboard a bien été réinitialisé.")
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        db.run(`UPDATE users SET lb = 0 WHERE guildId = ${interaction.guild.id}`);

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("<a:verifyyellow:1454545148510732369>・Le leaderboard a bien été réinitialisé.")
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    }
};
