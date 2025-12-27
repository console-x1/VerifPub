const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: 'guildDelete',
    async execute(client, guild) {
        const ownerGuilds = client.guilds.cache.filter(g => g.ownerId === guild.ownerId);

        const ownerUser = client.users.cache.get(guild.ownerId) || await client.users.fetch(guild.ownerId);

        const textContent = `# J'ai été retiré d'un serveur !\n\n` +
            `> <a:brokenheart:1414364526329073777> Il s'appelle \`${String(guild.name)}\`\n` +
            `> <:redmember:1454546334534205595> Il possède **${String(guild.memberCount)}** membres !!\n` +
            `> <:ownercrown_1:1454546346940829779> L'owner de ce serveur est <@${String(guild.ownerId)}> | \`${String(ownerUser.username)}\`\n_ _\n` +
            `J'ai maintenant **${String(client.guilds.cache.size)} serveurs** et **${String(client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0))} utilisateurs !**`;

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(textContent)
            )
        ];

        const targetChannel = client.channels.cache.get(client.config.sendGuildDelete);
        if (targetChannel) {
            try {
                await targetChannel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { roles: [], parse: [] } });
            } catch (e) {
                console.error("Erreur envoi message guildDelete (components v2 failed):", e);
                try {
                    await targetChannel.send({ content: textContent });
                } catch (e2) {
                    console.error("Erreur envoi message guildDelete (fallback plain content failed):", e2);
                }
            }
        } else {
            console.error("GuildDelete: target channel " + client.config.sendGuildDelete + " not found");
        }
    }
};
