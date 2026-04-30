const { SlashCommandBuilder, PermissionsBitField, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const self = require("../fonctions/antiSelfManager.js")

module.exports = {
    name: "know-self",
    description: "Marque comme selfbot un utilisateur.",
    aliases: ["sb"],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: true,

    async execute(client, message, args) {
        let content;

        if (!args || ((!args[0] && !args[1]) || (args[0] !== 'remove' && args[0] !== 'add'))) content = `<:staff:1454546318738329926> Utilisation correcte : ${client.config.prefix}know-self <add|remove> <userId> <:staff:1454546318738329926>`
        else if (args[0] == 'remove') self.removeId(args[1])
        else if (args[0] == 'add') self.addId(args[1])

        if (args[0] == 'remove') content = `<:staff:1454546318738329926> **<@${args[1]}> | \`${args[1]}\` a été supprimer de la liste des selfbots connus avec succès** <:staff:1454546318738329926>`
        else content = `<:staff:1454546318738329926> **<@${args[1]}> | \`${args[1]}\` a été ajouter dans la liste des selfbots connus avec succès** <:staff:1454546318738329926>`

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(content)
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        let content;
        const user = interaction.options.getUser('user').id
        const action = interaction.options.getString('action')

        if (action == 'remove') self.removeId(user)
        if (action == 'add') self.addId(user)

        if (action == 'remove') content = `<:staff:1454546318738329926> **<@${user}> | \`${user}\` a été supprimer de la liste des selfbots connus avec succès** <:staff:1454546318738329926>`
        else content = `<:staff:1454546318738329926> **<@${user}> | \`${user}\` a été ajouter dans la liste des selfbots connus avec succès** <:staff:1454546318738329926>`

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(content)
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('action')
                    .setDescription('Action a effectuer')
                    .addChoices(
                        { name: "Add", value: "add" },
                        { name: "Remove", value: "remove" }
                    )
                    .setRequired(true)
            )
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('user sur lequel vous voulez faire l\'action')
                    .setRequired(true)
            )
    }
};