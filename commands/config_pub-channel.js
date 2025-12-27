const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "config_pub-channel",
    description: "🛠️ configuration des salons publicitaires.",
    aliases: ["pub-channel", "advertisementchannel", "advertisement-channel", "config_pub", "config-pub", "config_advertisement", "adschannel", "ads-channel"],
    permissions: [PermissionsBitField.Flags.ManageChannels],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        if (!args[0]) {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Pub :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide.")
                )
            ];
            return message.reply({
                components,
                flags: MessageFlags.IsComponentsV2
            });
        }
        
        const channelId = args[0].replace(`<`, ``).replace(`#`, ``).replace(`>`, ``);
        const channelVerif = client.channels.cache.get(channelId);

        if (channelVerif) {
            db.run(`INSERT OR IGNORE INTO pubchannel (guildId, id) VALUES (?, ?)`, [
                message.guild.id,
                channelVerif.id,
            ]);
            db.run(`UPDATE pubchannel SET status = ? WHERE guildId = ? AND id = ?`, [1, message.guild.id, channelVerif.id]);

            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Pub :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・<#${channelVerif.id}> est maintenant un salon de publicité.`)
                )
            ];

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        } else {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Pub :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide.")
                )
            ];

            await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        }
    },

    async executeSlash(client, interaction) {
        const channelVerif = interaction.options.getChannel('channel');

        if (channelVerif) {
            db.run(`INSERT OR IGNORE INTO pubchannel (guildId, id) VALUES (?, ?)`, [interaction.guild.id, channelVerif.id]);
            db.run(`UPDATE pubchannel SET status = ? WHERE guildId = ? AND id = ?`, [1, interaction.guild.id, channelVerif.id]);

            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Pub :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`<a:verifyyellow:1454545148510732369>・<#${channelVerif.id}> est maintenant un salon de publicité.`)
                )
            ];

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        } else {
            const components = [
                new TextDisplayBuilder().setContent("<a:moderator:1454546370928316571> Pub :"),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Veuillez indiquer un salon valide.")
                )
            ];

            await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { repliedUser: false } });
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription("mettre l'ID du salon que vous voulez definir comme salon de pub.")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
    }
};