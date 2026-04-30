const { SlashCommandBuilder, PermissionsBitField, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const self = require("../fonctions/antiSelfManager.js")

module.exports = {
    name: "not-a-self",
    description: "Marque comme non-selfbot un utilisateur.",
    aliases: ["no-sb"],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: true,

    async execute(client, message, args) {
        let content;
        if (client.config.id !== '1405597638199480434') content = `<:staff:1454546318738329926> **Accès interdit ! Commande réservé aux développeurs !** <:staff:1454546318738329926>`

        if (!content) {
            if (!args || ((!args[0] && !args[1]) || (args[0] !== 'remove' && args[0] !== 'add'))) content = `<:staff:1454546318738329926> Utilisation correcte : ${client.config.prefix}not-a-self <add|remove> <userId> <:staff:1454546318738329926>`
            else if (args[0] !== 'add') self.removeNotSelfId(args[1])
            else if (args[0] !== 'remove') self.addNotSelfId(args[1])
        }

        if (!content) {
            if (args[0] == 'remove') content = `<:staff:1454546318738329926> **<@${args[1]}> | \`${args[1]}\` a été supprimer de la liste des non-selfbots connus avec succès** <:staff:1454546318738329926>`
            else content = `<:staff:1454546318738329926> **<@${args[1]}> | \`${args[1]}\` a été ajouter dans la liste des non-selfbots connus avec succès** <:staff:1454546318738329926>`
        }

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
        if (client.config.id !== '1405597638199480434') content = `<:staff:1454546318738329926> **Accès interdit ! Commande réservé aux développeurs !** <:staff:1454546318738329926>`

        if (!content) {
            if (action !== 'add') self.removeNotSelfId(user)
            if (action !== 'remove') self.addNotSelfId(user)
        }

        if (!content) {
            if (action == 'remove') content = `<:staff:1454546318738329926> **<@${user}> | \`${user}\` a été supprimer de la liste des non-selfbots connus avec succès** <:staff:1454546318738329926>`
            else content = `<:staff:1454546318738329926> **<@${user}> | \`${user}\` a été ajouter dans la liste des non-selfbots connus avec succès** <:staff:1454546318738329926>`
        }

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(content)
            )
        ];
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