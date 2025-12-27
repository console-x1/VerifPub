const { ContainerBuilder, TextDisplayBuilder, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");

const container = [];
const db = require('../fonctions/database.js');

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {

        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) return;

        if (interaction.customId.startsWith('sanction_remove')) {
            const userId = interaction.customId.split('_')[2];
            const sanctionId = interaction.values?.[0];
            try {
                await new Promise((resolve, reject) => {
                    db.run(`DELETE FROM sanctions WHERE date = ? AND userId = ?`, [sanctionId, userId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });

                const remaining = await new Promise((resolve, reject) => {
                    db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [interaction.guild.id, userId], (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows || []);
                    });
                });

                if (remaining.length > 0) {
                    const options = remaining.map((sanction, index) => ({
                        label: `${index + 1}. ${sanction.reason} - ${sanction.date}`,
                        value: sanction.date,
                        description: `Sanction ID: ${sanction.date}`,
                    }));

                    const updatedContainer = new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`**Liste des sanctions pour <@${userId}> :**\n\nVeuillez sélectionner la sanction à retirer dans le menu ci-dessous.`)
                    ).addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`sanction_delete_${userId}`)
                                .setPlaceholder('Sélectionnez une sanction à retirer')
                                .addOptions(options)
                        )
                    );

                    await interaction.update({ components: [updatedContainer], flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } }).catch(() => { });

                }
                const successContainer = new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<a:validate:1454545158388322334> Sanction retirée avec succès.")
                );
                await interaction.reply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } })
            } catch (err) {
                console.error(err);
                const errorContainer = new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("<:X_:1454545141397327903> Une erreur est survenue lors de la suppression de la sanction.")
                );
                await interaction.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } }).catch(() => { });
            }
        }
    }
};
