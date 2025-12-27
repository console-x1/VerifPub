const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "pubchannel",
    description: "📜 Permet la visualisation des salons publicitaires",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ManageChannels],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        message.delete();

        let data = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id FROM pubchannel WHERE guildId = ? AND status != 0`,
                [message.guild.id],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                },
            );
        });

        const channelsList = data.map(row => `<#${row.id}>`).join("\n");

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:bolt:1414071931904327852> Voici la liste des salons publicitaires :\n${channelsList}`)
            )
        ];

        await message.channel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        let data = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id FROM pubchannel WHERE guildId = ? AND status != 0`,
                [interaction.guild.id],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                },
            );
        });

        const channelsList = data.map(row => `<#${row.id}>`).join("\n");

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:bolt:1414071931904327852> Voici la liste des salons publicitaires :\n${channelsList}`)
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
    }
};
