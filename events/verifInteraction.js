const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags, SeparatorSpacingSize, SeparatorBuilder } = require("discord.js");
const loggT = require('../loggerT.js');
const loggE = require('../loggerE.js');
const loggV = require('../loggerV.js');

const db = require("../fonctions/database.js");
const pubs = require("../fonctions/pubsManager.js");

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        const validIds = ["valider", "refuser", "refusRow", "supprimer"];
        if (!validIds.includes(interaction.customId)) return;
        if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

        try {
            const embed = interaction.message.embeds[0];
            if (!embed || !embed.fields?.length) return;

            const userId = (embed.fields[0].value.match(/\d{17,19}/) || [null])[0];
            const channelId = (embed.fields[1].value.match(/\d{17,19}/) || [null])[0];
            const messageId = (embed.fields[2].value.match(/\d{17,19}/) || [null])[0];
            const messagePub = embed.description || null;

            if (!userId || !channelId || !messageId || !messagePub) return;
            if (userId === interaction.user.id) {
                const components = []
                components.push(
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("<:X_:1454545141397327903>・Vous ne pouvez pas vérifier votre propre pub.")
                    )
                );
                return interaction.reply({ components, flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { repliedUser: false } });
            }
            const pubeur = client.users.cache.get(userId);

            const deleteMessageSafe = async (cid, mid) => {
                const ch = await client.channels.fetch(cid).catch(() => null);
                if (!ch) return;
                const msg = await ch.messages.fetch(mid).catch(() => null);
                if (msg) await msg.delete().catch(() => { });
            };

            const refusReasons = {
                nsfwRefus: { title: "・Contenu à caractère pornographique.", emoji: "<:nsfw:1454546361654448138>" },
                tosRefus: { title: "・Publicité ne respectant pas les ToS ou le règlement.", emoji: "<:applicationdenied:1414071916968280224>" },
                haineuxRefus: { title: "・Pub contenant des textes racistes/haineux.", emoji: "<:applicationpending:1414071919141060630>" },
                lienInvalideRefus: { title: "・Lien d'invitation invalide.", emoji: "<:X_:1454545141397327903>" },
                mauvaisSalonRefus: { title: "・Pub dans le mauvais salon.", emoji: "<a:redalert:1262160513689714688>" },
                sansDescRefus: { title: "・Pub sans description.", emoji: "<:X_:1454545141397327903>" }
            };

            // --- Boutons ---
            if (interaction.isButton()) {
                if (interaction.customId === "valider") {
                    await interaction.message.delete().catch(() => { });
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, null, "valide");
                    const channelPub = client.channels.cache.get(channelId);
                    if (channelPub) {
                        channelPub.messages.fetch(messageId).then(msg => {
                            msg.reactions.resolve('⌛')?.remove().catch(() => { });
                            msg.react('<a:validate:1454545158388322334>').catch(() => { });
                        }).catch(() => { });
                    }
                }
                if (interaction.customId === "refuser") {
                    const refusMenu = new ActionRowBuilder().setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("refusRow")
                            .setPlaceholder("Choisir une raison de refus !")
                            .setOptions([
                                { emoji: "<a:moderator:1454546370928316571>", label: "・Choix d'une sanction :", value: "default", setDefault: true },
                                ...Object.entries(refusReasons).map(([val, desc]) => ({
                                    emoji: desc.emoji, label: `${desc.title}`, value: val
                                })),
                                { emoji: "<a:moderator:1454546370928316571>", label: "・Mettre sa propre raison :", description: "Choisir une raison personnelle.", value: "persoRefus" },
                                { emoji: "<a:verifyyellow:1454545148510732369>", label: "・Annuler et valider", description: "Cela validera la pub", value: "valide" },
                                { emoji: "<:X_:1454545141397327903>", label: "・Annuler et supprimer", description: "Cela supprimera la pub", value: "delete" }
                            ])
                    );
                    await interaction.message.edit({ components: [refusMenu] }).catch(() => { });
                }
                if (interaction.customId === "supprimer") {
                    await interaction.message.delete().catch(() => { });
                    await deleteMessageSafe(channelId, messageId);
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, null, "delete");
                }
            }

            // --- Select Menu ---
            if (interaction.isStringSelectMenu()) {
                const choice = interaction.values?.[0];
                if (refusReasons[choice]) {
                    await interaction.message.delete().catch(() => { });
                    await deleteMessageSafe(channelId, messageId);
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, refusReasons[choice].title.replace('・', ''), "refus");
                }
                if (choice === "persoRefus") {
                    const prompt = await interaction.message.reply({ content: "<:X_:1454545141397327903>・Quelle raison voulez-vous mettre ?" });
                    const filter = m => m.author.id === interaction.user.id;
                    const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
                    if (!collected?.size) return prompt.delete().catch(() => { });
                    const msgRefus = collected.first().content.trim();
                    collected.first().delete().catch(() => { });
                    prompt.delete().catch(() => { });
                    if (!msgRefus) return;
                    await interaction.message.delete().catch(() => { });
                    await deleteMessageSafe(channelId, messageId);
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, msgRefus, "refus");
                }
                if (choice === "valide") {
                    await interaction.message.delete().catch(() => { });
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, null, "valide");
                }
                if (choice === "delete") {
                    await interaction.message.delete().catch(() => { });
                    await deleteMessageSafe(channelId, messageId);
                    logsmsg(userId, pubeur, channelId, messageId, messagePub, null, "delete");
                }
            }

            // --- Leaderboard ---
            db.run(`UPDATE users SET lb = lb + ? WHERE guildId = ? AND userId = ?`, [1, interaction.guild.id, interaction.user.id]);

            // --- Logs function ---
            async function logsmsg(userID, pubeur, channelId, messageId, messagePub, refus, status) {
                console.log((`[VERIF] ${interaction.guild.name} | ${interaction.user.username} a vérifié une publicité. `.green) + (status == "valide" ? `(valide)`.green : status == "delete" ? `(delete)`.grey : `(refus )`.red));
                loggV(`[VERIF] ${interaction.guild.name} / ${interaction.guild.id} |  ${interaction.user.id} / ${interaction.user.username}#${interaction.user.discriminator} a vérifié une publicité. (${status})`);

                if (status === "refus") {
                    const donneeUserPubSanction = await new Promise((resolve, reject) => {
                        db.all(`SELECT * FROM sanctions WHERE guildId = ? AND userId = ?`, [interaction.guild.id, userID], (err, row) => {
                            if (err) reject(err);
                            resolve(row);
                        });
                    });

                    const sanctionCount = donneeUserPubSanction.length + 1;

                    const currentDate = new Date();
                    const formattedDate = currentDate.toISOString().replace('T', ' ').split('.')[0];

                    db.run(`INSERT INTO sanctions (guildId, userId, reason, date) VALUES (?, ?, ?, ?)`, [interaction.guild.id, userID, refus, formattedDate]);

                    const components = [
                        new ContainerBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`## <:warning:1454545145650479382>・__Nouvelle sanction !__\n\n`),
                            new TextDisplayBuilder().setContent(`<:fire:1414072120819974214>・**Serveur** : ${interaction.guild.name}\n<:X_:1454545141397327903>・**Salon** : <#${channelId}>\n<a:moderator:1454546370928316571>・**Raison** : ${refus}\n<:warning:1454545145650479382>・**Modérateur** : <@${interaction.user.id}>\n<:bolt:1414071931904327852>・**Sanction n°${(sanctionCount)}**`)
                        )
                    ]

                    if (pubeur) pubeur.send({ components, flags: MessageFlags.IsComponentsV2 }).catch(() => { });

                    const sanctionData = await new Promise((resolve, reject) => {
                        db.get(`SELECT * FROM guilds WHERE guildId = ?`, [interaction.guild.id], (err, row) => {
                            if (err) reject(err);
                            resolve(row);
                        });
                    });

                    if (sanctionData?.sanctionchannel) {
                        const ch = client.channels.cache.get(sanctionData.sanctionchannel);
                        if (ch) {
                            ch.send({ content: `<a:redalert:1262160513689714688>・Nouvelle sanction pour <@${userID}> :` }).then(() => {
                                ch.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
                            });
                        }
                    }
                }

                let score = 1
                if (status == "refus") score = -4
                else if (status == "delete") score = -2
                pubs.incrementScore(messagePub, userId, channelId, score);

                const guildData = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM guilds WHERE guildId = ?`, [interaction.guild.id], (err, row) => {
                        if (err) reject(err);
                        resolve(row);
                    });
                });

                const logCh = client.channels.cache.get(guildData?.logschannel);
                if (!logCh) return;

                let titre = status === "valide" ? "<a:verifyyellow:1454545148510732369>・Nouvelle publicité validée"
                    : status === "refus" ? "<:X_:1454545141397327903>・Nouvelle publicité refusée"
                        : "<:X_:1454545141397327903>・Nouvelle publicité supprimée";

                const logsEmbed = new EmbedBuilder()
                    .setTitle(`${titre} :`)
                    .setDescription(messagePub + '\n\n')
                    .addFields(
                        { name: "Utilisateur :", value: `<@${pubeur.id}> | \`${pubeur.username}\` | \`${pubeur.id}\``, inline: false },
                        { name: "Salon :", value: `<#${channelId}> | \`${channelId}\``, inline: false },
                        { name: "Vérificateur :", value: `<@${interaction.user.id}> | \`${interaction.user.username}\` | \`${interaction.user.id}\``, inline: false }
                    );

                if (status === "refus") {
                    logsEmbed.addFields({ name: 'Avertissement :', value: refus });
                    logsEmbed.setColor('#dd0000');
                    logCh.send({ embeds: [logsEmbed] });
                }
                if (status === "valide") {
                    logsEmbed.addFields({ name: "Publicité :", value: `https://discord.com/channels/${interaction.guild.id}/${channelId}/${messageId}` });
                    logsEmbed.setColor("Green");
                    const buttonLien = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setLabel('Lien du message').setURL(`https://discord.com/channels/${interaction.guild.id}/${channelId}/${messageId}`).setStyle(ButtonStyle.Link)
                    );
                    logCh.send({ embeds: [logsEmbed], components: [buttonLien] });
                }
                if (status === "delete") {
                    logsEmbed.setColor("000001");
                    logCh.send({ embeds: [logsEmbed] });
                }
            }
        } catch (err) {
            loggE(err);
            console.error(err);
        }
    }
};