const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const path = require("path");

module.exports = {
    name: "version",
    description: "🧮 Affiche la version du bot.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        message.delete();
        const V = require(path.resolve('./package.json'));

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<a:bulletpoint:1414071939395223572> __Ma version est :__ **${V.version}** <a:bulletpoint:1414071939395223572>`)
            )
        ];

        await message.channel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const V = require(path.resolve('./package.json'));

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<a:bulletpoint:1414071939395223572> __Je suis à la version :__ **${V.version}** <a:bulletpoint:1414071939395223572>`)
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