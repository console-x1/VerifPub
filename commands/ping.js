const { SlashCommandBuilder, PermissionsBitField, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

module.exports = {
    name: "ping",
    description: "🏓 Affiche le ping du bot.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:wifi:1454545143825694781> **Mon ping est de :** __${client.ws.ping} ms.__ <:wifi:1454545143825694781>`)
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:wifi:1454545143825694781> **Mon ping est de :** __${client.ws.ping} ms.__ <:wifi:1454545143825694781>`)
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
    }
};