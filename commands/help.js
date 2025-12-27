const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");

module.exports = {
    name: "help",
    description: "🤔 Affiche le HELP du bot.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ViewChannel],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Mon prefix est : **${client.config.prefix}**
⭐ Je suis sur **${client.guilds.cache.size} serveurs** et j'ai donc **${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} utilisateurs** ⭐`)
            ),

            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large),

            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_helpFR')
                    .setLabel("Aide à la configuration")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🇫🇷"),
                new ButtonBuilder()
                    .setCustomId('config_helpEN')
                    .setLabel("Configuration help")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🇺🇸"),
                new ButtonBuilder()
                    .setLabel("Bot")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
                    .setEmoji("<a:uploadneon:1454545160053723197>"),
                new ButtonBuilder()
                    .setLabel("Support")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/users/1066067393123733595`)
                    .setEmoji("<:stafficon:1454546313571209287>")
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Mon prefix est : **${client.config.prefix}**
⭐ Je suis sur **${client.guilds.cache.size} serveurs** et j'ai donc **${client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0)} utilisateurs** ⭐`)
            ),

            new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Large),

            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('config_helpFR')
                    .setLabel("Aide à la configuration")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🇫🇷"),
                new ButtonBuilder()
                    .setCustomId('config_helpEN')
                    .setLabel("Configuration help")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🇺🇸"),
                new ButtonBuilder()
                    .setLabel("Bot")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}`)
                    .setEmoji("<a:uploadneon:1454545160053723197>"),
                new ButtonBuilder()
                    .setLabel("Support")
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/users/1066067393123733595`)
                    .setEmoji("<:stafficon:1454546313571209287>")
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