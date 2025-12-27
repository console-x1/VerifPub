const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, MessageFlags, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");

const db = require("../fonctions/database.js");

function createSuccessComponents() {
    return [
        new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("<a:verifyyellow:1414364545975324823> Messages supprimés avec succès.")
        )
    ];
}

function createErrorComponents(msgFR) {
    return [
        new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`<:warning:1414161189059035167> ${msgFR}`)
        )
    ];
}

module.exports = {
    name: "supprime",
    description: "👑 supprime un nombre de message défini.",
    aliases: ["clear"],
    permissions: [PermissionsBitField.Flags.ManageMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const donnee = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE userId =?`, [message.author.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        const nombre = Number(args[0] || 0);
        if (!nombre || nombre <= 0) {
            return message.channel.send({
                components: createErrorComponents("Veuillez spécifier un nombre valide de messages à supprimer."),
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] }
            });
        }

        const limite = 100;
        if (nombre > limite) {
            return message.channel.send({
                components: createErrorComponents(`Je ne peux supprimer plus de ${limite} messages.`),
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] }
            });
        }

        try {
            await message.channel.bulkDelete(nombre);
            await message.channel.send({
                components: createSuccessComponents(),
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] }
            });
        } catch {
            await message.channel.send({
                components: createErrorComponents("Une erreur est survenue lors de la suppression. Vérifiez que les messages ont moins de 14 jours."),
                flags: MessageFlags.IsComponentsV2,
                allowedMentions: { parse: [] }
            });
        }
    },

    async executeSlash(client, interaction) {
        const nombre = interaction.options.getInteger("nombre");

        const donnee = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE userId =?`, [interaction.user.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        const limite = 100;
        if (nombre > limite || nombre <= 0) {
            return interaction.reply({
                components: createErrorComponents(`Je ne peux supprimer plus de ${limite} messages.`),
                flags: MessageFlags.IsComponentsV2 | 64, 
                allowedMentions: { parse: [] }
            });
        }

        try {
            await interaction.channel.bulkDelete(nombre);
            await interaction.reply({
                components: createSuccessComponents(),
                flags: MessageFlags.IsComponentsV2 | 64, 
                allowedMentions: { parse: [] }
            });
        } catch {
            await interaction.reply({
                components: createErrorComponents("Une erreur est survenue lors de la suppression. Vérifiez que les messages ont moins de 14 jours."),
                flags: MessageFlags.IsComponentsV2 | 64, 
                allowedMentions: { parse: [] }
            });
        }
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
            .addIntegerOption(option =>
                option
                    .setName("nombre")
                    .setMinValue(1)
                    .setMaxValue(100)
                    .setDescription("Le nombre de messages à supprimer.")
                    .setRequired(true)
            );
    }
};
