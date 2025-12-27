const { ContainerBuilder, TextDisplayBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const db = require("../fonctions/database.js");

module.exports = {
    name: "guildCreate",
    async execute(client, guild) {
        db.run(`INSERT OR IGNORE INTO guilds (guildId) VALUES (?)`, [guild.id]);
        db.run(`INSERT OR IGNORE INTO autoembeds (guildId) VALUES (?)`, [guild.id]);

        guild.channels.cache.forEach((channel) => {
            db.run(`INSERT OR IGNORE INTO pubchannel (guildId, id) VALUES (?, ?)`, [
                guild.id,
                channel.id,
            ]);
        });

        guild.members.cache.forEach((member) => {
            db.run(`INSERT OR IGNORE INTO users (guildId, userId) VALUES (?, ?)`, [
                guild.id,
                member.id,
            ]);
        });

        const ownerGuilds = client.guilds.cache.filter(g => g.ownerId === guild.ownerId);

        let channelInvite = guild.systemChannel
            ?? guild.channels.cache.find(ch => ch.type === 0);
        let invite = null;

        try {
            invite = channelInvite ? await channelInvite.createInvite({ maxAge: 0, maxUses: 0 }) : null;
        } catch (err) {
            invite = null;
        }

        const textContent = `# J'ai été ajouté à un serveur !\n\n` +
            `> <:_Verif_:1262161060165849200> Il s'appelle \`${String(guild.name)}\`\n` +
            `> <:redmember:1414072312616980560> Il possède **${String(guild.memberCount)}** membres !!\n` +
            `> <:rocket:1414072318212309032> Le nombre de boost est **${String(guild.premiumSubscriptionCount)}**\n` +
            `> <:trophy_1:1454546257556279492> L'owner de ce serveur est <@${String(guild.ownerId)}> | \`${String(client.users.cache.get(guild.ownerId)?.username)}\`\n_ _\n` +
            `J'ai maintenant **${String(client.guilds.cache.size)} serveurs** et **${String(client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))} utilisateurs !**\n\n` +
            `> <:ownercrown_1:1454546346940829779> L'owner est également propriétaire de **${String(ownerGuilds.size)}** serveur(s)`;

        const textWithInvite = textContent + `\n\nInvite : ${invite?.url ?? "(invitation indisponible)"}`;

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(textContent)
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Rejoindre le serveur !")
                    .setStyle(ButtonStyle.Link)
                    .setURL(invite?.url ?? "https://discord.com/echec-de-la-creation-d-invitation")
            )
        ];

        const targetChannel = client.channels.cache.get(client.config.sendGuildAdd);
        if (targetChannel) {
            try {
                await targetChannel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { roles: [], parse: [] } });
            } catch (e) {
                console.error("Erreur envoi message guildAdd (components v2 failed):", e);
                try {
                    await targetChannel.send({ content: textWithInvite, allowedMentions: { roles: [], parse: [] } });
                } catch (e2) {
                    console.error("Erreur envoi message guildAdd (fallback plain content failed):", e2);
                }
            }
        } else {
            console.error("GuildAdd: target channel " + client.config.sendGuildAdd + " not found");
        }
    }
};