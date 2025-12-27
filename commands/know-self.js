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
        if (client.config.id !== '1405597638199480434') content = `<:config:1414072057959809034> **Accès interdit ! Commande réservé aux développeurs !** <:config:1414072057959809034>`

        if (!content) {
            if (!args || ((!args[0] && !args[1]) || (args[0] !== 'remove' && args[0] !== 'add'))) content = `<:config:1414072057959809034> Utilisation correcte : ${client.config.prefix}know-self <add|remove> <userId> <:config:1414072057959809034>`
            else if (args[0] !== 'add') self.removeId(args[1])
            else if (args[0] !== 'remove') self.addId(args[1])
        }

        if (!content) {
            if (args[0] == 'remove') content = `<:config:1414072057959809034> **<@${args[1]}> | \`${args[1]}\` a été supprimer de la liste des selfbots connus avec succès** <:config:1414072057959809034>`
            else content = `<:config:1414072057959809034> **<@${args[1]}> | \`${args[1]}\` a été ajouter dans la liste des selfbots connus avec succès** <:config:1414072057959809034>`
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
        if (client.config.id !== '1405597638199480434') content = `<:config:1414072057959809034> **Accès interdit ! Commande réservé aux développeurs !** <:config:1414072057959809034>`

        if (!content) {
            if (action !== 'add') self.removeId(user)
            if (action !== 'remove') self.addId(user)
        }

        if (!content) {
            if (action == 'remove') content = `<:config:1414072057959809034> **<@${user}> | \`${user}\` a été supprimer de la liste des selfbots connus avec succès** <:config:1414072057959809034>`
            else content = `<:config:1414072057959809034> **<@${user}> | \`${user}\` a été ajouter dans la liste des selfbots connus avec succès** <:config:1414072057959809034>`
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