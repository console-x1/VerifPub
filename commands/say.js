const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "say",
    description: "💬 envoyer un message sous mon noms.",
    aliases: [],
    permissions: [PermissionsBitField.Flags.ManageMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) { 
        message.delete()
        if (!args[0]) return message.reply('<a:bulletpoint:1414071939395223572> Veuillez spécifier un message à envoyer sous mon nom.').then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 5000);
        });
        let msg = ""
        for (let i = 0; i < args.length; i++) {
          msg += args[i] + ' '
        }
        message.channel.send({ content: msg, allowedMentions: { users: [], roles: [], parse: [] } })
     },
    async executeSlash(client, interaction) {
        const message = interaction.options.getString('message')
        
        interaction.reply({ content: message, flags: 64, allowedMentions: { parse: [] } })
        interaction.channel.send({ content: message, allowedMentions: { roles: [], parse: [] } })

    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('message')
                    .setDescription("message que vous voulez envoyer sous mon nom")
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
    }
}