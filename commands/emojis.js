const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");

async function sendChunks(guild, channel) {
    const chunkSize = 1900;

    let sortedEmojis = guild.emojis.cache.sort((a, b) => {
        if (a.animated && !b.animated) return -1;
        if (!a.animated && b.animated) return 1;
        return a.name.localeCompare(b.name);
    });
    let output = sortedEmojis.map(e => `### ${e.toString()} → \`${e}\``).join('\n');

    while (output.length > 0) {
        const chunk = output.slice(0, chunkSize);
        const lastNewLine = chunk.lastIndexOf('\n');
        let sendText;

        if (lastNewLine === -1) {
            const nextNewLine = output.indexOf('\n', chunkSize);
            if (nextNewLine !== -1 && nextNewLine <= 1990) {
                sendText = output.slice(0, nextNewLine + 1);
                output = output.slice(nextNewLine + 1);
            } else {
                sendText = chunk;
                output = output.slice(chunk.length);
            }
        } else {
            sendText = chunk.slice(0, lastNewLine + 1);
            output = output.slice(lastNewLine + 1);
        }

        try {
            await channel.send(sendText);
        } catch (err) {
            console.log(err);
            break;
        }
    }
}

module.exports = {
    name: "emojis",
    description: "👑 Liste les emojis du serveur.",
    aliases: ["emoji"],
    permissions: [PermissionsBitField.Flags.ManageGuildExpressions],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
    await sendChunks(message.guild, message.channel);
    },

    async executeSlash(client, interaction) {
    await sendChunks(interaction.guild, interaction.channel);
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions);
    }
};
