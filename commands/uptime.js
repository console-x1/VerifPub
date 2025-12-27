const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

module.exports = {
    name: "uptime",
    description: "🤖 Afficher depuis combien de temps le bot est en ligne.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        const uptime = client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime / 3600000) % 24);
        const minutes = Math.floor((uptime / 60000) % 60);
        const seconds = Math.floor((uptime / 1000) % 60);
        const ms = Math.floor(uptime % 1000);

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`📊 __Je suis en ligne depuis :__\n<a:uploadneon:1454545160053723197> ${days} jour(s), ${hours} heure(s), ${minutes} minute(s), ${seconds} seconde(s) et ${ms} millisecondes. <a:uploadneon:1454545160053723197>\n<:wifi:1454545143825694781> Mon ping est de ${client.ws.ping} ms. <:wifi:1454545143825694781>`)
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const uptime = client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime / 3600000) % 24);
        const minutes = Math.floor((uptime / 60000) % 60);
        const seconds = Math.floor((uptime / 1000) % 60);
        const ms = Math.floor(uptime % 1000);

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`📊 __Je suis en ligne depuis :__\n<a:uploadneon:1454545160053723197> ${days} jour(s), ${hours} heure(s), ${minutes} minute(s), ${seconds} seconde(s) et ${ms} millisecondes. <a:uploadneon:1454545160053723197>\n<:wifi:1454545143825694781> Mon ping est de ${client.ws.ping} ms. <:wifi:1454545143825694781>`)
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