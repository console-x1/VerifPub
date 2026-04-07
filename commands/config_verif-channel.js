const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "config_verif-channel",
    description: "🛠️ configuration du salon de verification publicitaire.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ManageChannels],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const channelVerif = client.channels.cache.get(args[0]?.replace(/<|#|>/g, ''));

        const components = [];

        if (channelVerif) {
            db.run(`UPDATE guilds SET verifchannel = ? WHERE guildId = ?`, [channelVerif.id, message.guild.id]);

            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Verification :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・Le salon de verification a été correctement configuré sur <#${channelVerif.id}>.`)
                )
            );

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });

            const helpVerifFR = 'Ici seront affichées les publicités des utilisateurs ainsi que des boutons pour accepter la publicité, avertir le membre et pour simplement la supprimer.\n<a:verifyyellow:1454545148510732369> -> Valider la publicité\n<:X_:1454545141397327903> -> Avertir le membre\n🗑️ -> Supprimer la publicité (cela n\'avertit pas le membre).\n\n<:warning:1454545145650479382> Les bots ne sont pas ignorés par le système et les publicités de moins de 30 caractères sont automatiquement supprimées. <:warning:1454545145650479382>';

            const verificationComponents = [
                new TextDisplayBuilder().setContent('<a:moderator:1454546370928316571>Verification :'),
                new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(helpVerifFR))
            ];

            client.channels.cache.get(channelVerif.id)?.send({ components: verificationComponents, flags: MessageFlags.IsComponentsV2 }).catch(() => {});

        } else {
            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Verification :"),
                new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide."))
            );

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        }
    },

    async executeSlash(client, interaction) {
        const channelVerif = interaction.options.getChannel('channel');

        const components = [];

        if (channelVerif) {
            db.run(`UPDATE guilds SET verifchannel = ? WHERE guildId = ?`, [channelVerif.id, interaction.guild.id]);

            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Verification :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・Le salon de verification a été correctement configuré sur <#${channelVerif.id}>.`)
                )
            );

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { repliedUser: false } });

            const helpVerifFR = 'Ici seront affichées les publicités des utilisateurs ainsi que des boutons pour accepter la publicité, avertir le membre et pour simplement la supprimer.\n<a:verifyyellow:1454545148510732369> -> Valider la publicité\n<:X_:1454545141397327903> -> Avertir le membre\n🗑️ -> Supprimer la publicité (cela n\'avertit pas le membre).\n\n<:warning:1454545145650479382> Les bots ne sont pas ignorés par le système et les publicités de moins de 30 caractères sont automatiquement supprimées. <:warning:1454545145650479382>';

            const verificationComponents = [
                new TextDisplayBuilder().setContent('<a:moderator:1454546370928316571>Verification :'),
                new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(helpVerifFR))
            ];

            client.channels.cache.get(channelVerif.id)?.send({ components: verificationComponents, flags: MessageFlags.IsComponentsV2 }).catch(() => {});

        } else {
            components.push(
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571>Verification :"),
                new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide."))
            );

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { repliedUser: false } });
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription("Veuillez choisir le salon de verification.")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
    }
};