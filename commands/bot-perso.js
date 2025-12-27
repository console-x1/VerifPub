const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");

const INVITE_URL = "https://discord.gg/fJjuY5BEJr";
const IMAGE_URL = "https://media.discordapp.net/attachments/1032947681619890268/1226269898200846437/rainbow_middle_load-1.gif";

function createBotPersonnelComponents() {
    return [
        new TextDisplayBuilder().setContent("<:_Verif_:1262161060165849200> **Bot Personnel"),
        new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<a:bot:1414071978771349504> Tu peux obtenir un bot personnalisé ici : <${INVITE_URL}>`),
        )
    ];
}

module.exports = {
    name: "bot-personnel",
    description: "❗ Affiche un serveur qui crée des bots de verification publicitaires personnalisés.",
    aliases: ["perso", "bot", "custom", "bot-perso", "bot-personal"],
    permissions: [PermissionsBitField.Flags.ViewChannel],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message) {
        const components = createBotPersonnelComponents();
        message.reply({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] }
        }).catch(() => { });
    },
    async executeSlash(client, interaction) {
        const components = createBotPersonnelComponents();
        interaction.reply({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] }
        }).catch(() => { });
    },
    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);
    }
}