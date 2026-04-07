const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "config_sanction-channel",
    description: "🛠️ configuration du salon de sanction publicitaires.",
    aliases: ["sanctionchannel", "sanction-channel", "config_sanction", "schannel", "s-channel", "warningchannel", "warning-channel", "warnchannel", "warn-channel"],
    permissions: [PermissionsBitField.Flags.ManageChannels],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const channelVerif = client.channels.cache.get(args[0]?.replace(/<|#|>/g, ''));

        const components = [];

        if (channelVerif) {
            db.run(`UPDATE guilds SET sanctionchannel = ? WHERE guildId = ?`, [channelVerif.id, message.guild.id]);

            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Sanctions :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・Le salon de sanction a été correctement configuré sur <#${channelVerif.id}>.`)
                )
            );

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });

            const sanctionComponents = [
                new TextDisplayBuilder().setContent('<a:moderator:1454546370928316571>Sanction :'),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('Ici seront affichées les sanctions des utilisateurs ainsi que les motifs des sanctions. Les sanctions sont aussi reçues en MP.')
                )
            ];

            client.channels.cache.get(channelVerif.id)?.send({ components: sanctionComponents, flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } else {
            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Sanctions :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide.")
                )
            );

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        }
    },

    async executeSlash(client, interaction) {
        const channelVerif = interaction.options.getChannel('channel');

        const components = [];

        if (channelVerif) {
            db.run(`UPDATE guilds SET sanctionchannel = ? WHERE guildId = ?`, [channelVerif.id, interaction.guild.id]);

            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Sanctions :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・Le salon de sanction a été correctement configuré sur <#${channelVerif.id}>.`)
                )
            );

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });

            const sanctionComponents = [
                new TextDisplayBuilder().setContent('<a:moderator:1454546370928316571>Sanction :'),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('Ici seront affichées les sanctions des utilisateurs ainsi que les motifs des sanctions. Les sanctions sont aussi reçues en MP.')
                )
            ];

            client.channels.cache.get(channelVerif.id)?.send({ components: sanctionComponents, flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } else {
            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Sanctions :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide.")
                )
            );

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription("Veuillez choisir le salon de sanction.")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
    }
};