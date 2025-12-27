const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "config_logs-channel",
    description: "🛠️ configuration du salon de log publicitaires.",
    aliases: ["logs", "log", "logschannel", "log-channel", "config_logs", "config_log"],
    permissions: [PermissionsBitField.Flags.Administrator],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        if (!args[0]) {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1414364533920632842> Logs :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1414375775330635816>・Veuillez indiquer un salon valide.")
                )
            ];
            return message.reply({
                components,
                flags: MessageFlags.IsComponentsV2
            });
        }

        let channel = args[0];
        channel = channel.replace(`<`, ``).replace(`#`, ``).replace(`>`, ``);

        const channelVerif = client.channels.cache.get(channel);
        if (channelVerif) {
            db.run(
                `UPDATE guilds SET logschannel = ? WHERE guildId = ?`,
                [channel, message.guild.id],
            );

            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1414364533920632842> Logs :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1414364545975324823>・Enregistrement du salon de logs a été correctement effectué sur <#${channelVerif.id}>.`)
                )
            ];

            await message.reply({
                components,
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { repliedUser: false }
            });
        } else {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1414364533920632842> Logs :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1414375775330635816>・Veuillez indiquer un salon valide.")
                )
            ];

            await message.reply({
                components,
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { repliedUser: false }
            });
        }
    },
    async executeSlash(client, interaction) {
        let channel = interaction.options.getChannel('channel');
        const channelVerif = client.channels.cache.get(channel.id);
        if (channelVerif) {
            db.run(
                `UPDATE guilds SET logschannel = ? WHERE guildId = ?`,
                [channel.id, interaction.guild.id],
            );

            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1414364533920632842> Logs :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1414364545975324823>・Enregistrement du salon de logs a été correctement effectué sur <#${channelVerif.id}>.`)
                )
            ];

            await interaction.reply({
                components,
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { repliedUser: false }
            });
        } else {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1414364533920632842> Logs :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1414375775330635816>・Veuillez indiquer un salon valide.")
                )
            ];

            await interaction.reply({
                components,
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { repliedUser: false }
            });
        }

    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription("mettre l'id salon auquel vous voulez appliquer les logs.")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    }
}