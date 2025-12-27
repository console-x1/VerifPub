const { ActivityType, MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");
const db = require("../fonctions/database.js");

const colors = require("colors");

const path = require("path")
const V = require(path.resolve(path.join('./package.json')))

const loggT = require("../loggerT")

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        loggT('\n')
        loggT(`[READY]  ${client.user.tag} est prêt ||| ${client.guilds.cache.size} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} utilisateurs`);
        console.log(`[READY]  ${client.user.tag} est prêt ||| ${client.guilds.cache.size} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} utilisateurs`.blue);

        client.user.setStatus("Online")
        setInterval(() => {
            let randomA = Math.floor(Math.random() * status.length);
            client.user.setActivity(status[randomA]);
        }, 10000);

        const channel = await client.channels.cache.get(client.config.sendStartMsgId);

        async function sendReadyEmbed() {
            const start = Date.now();
            await fetch("https://www.google.com").catch(() => { });
            const end = Date.now();
            const ping = end - start;
            const components = [
                new TextDisplayBuilder().setContent(`## <a:Verif:1262343698385993801> Je suis opérationnel !`),
                new ContainerBuilder().addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `<:wifi:1454545143825694781> **Ping :** ${ping} ms\n` +
                        `<:trophy_1:1454546257556279492> J'ai **${client.guilds.cache.size} serveurs** et **${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} utilisateurs !**\n` + 
                        `-# ${client.user.username} v${V.version}`
                    )
                )
            ];

            await channel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
        }
        if (client.config.sendStartMsg) sendReadyEmbed();

        client.guilds.cache.forEach(async (guild) => {
            db.run(
                `INSERT OR IGNORE INTO guilds (guildId) VALUES (?)`,
                [guild.id],
            );
            db.run(
                `INSERT OR IGNORE INTO autoembeds (guildId) VALUES (?)`,
                [guild.id],
            );
            guild.channels.cache.forEach((channel) => {
                db.run(`INSERT OR IGNORE INTO pubchannel (guildId, id) VALUES (?, ?)`, [
                    guild.id,
                    channel.id,
                ]);
            })
            guild.members.cache.forEach((member) => {
                db.run(`INSERT OR IGNORE INTO users (guildId, userId) VALUES (?, ?)`, [
                    guild.id,
                    member.id,
                ]);
            })
        })
    }
}


let status = [
    {
        name: 'Beta publique',
        type: ActivityType.Custom,
    },
    {
        name: 'vBeta ' + V.version + (V.description ? ' - ' + V.description : ''),
        type: ActivityType.Custom,
    },
]