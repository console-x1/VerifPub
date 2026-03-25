const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

module.exports = {
    name: "prefix",
    description: "❗ Afficher le prefix du bot.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ViewChannel],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:fire:1414072120819974214> Mon prefix est : **${client.config.prefix}**`)
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:fire:1414072120819974214> Mon prefix est : **${client.config.prefix}**`)
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);
    }
};