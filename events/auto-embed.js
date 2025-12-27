const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (client.config.id.includes(message.author.id)) return;
        if (!message.guild) return;

        let pubchannel = await new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM pubchannel WHERE guildId = ? AND id = ?`,
                [message.guild.id, message.channel.id],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!pubchannel || pubchannel.status == 0 && message.channel.parentId) {
            pubchannel = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT * FROM pubchannel WHERE guildId = ? AND id = ?`,
                    [message.guild.id, message.channel.parentId],
                    (err, row) => {
                        if (err) reject(err);
                        resolve(row);
                    }
                );
            });
        }

        if (!pubchannel) return;
        if (pubchannel.status == 0) return;

        //Si le message est trop petit
        if (message.content.length < 30) {
            return
        }

        const autoembed = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM autoembeds WHERE guildId = ?`, [message.guild.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        if (!autoembed.status) return

        //Si le système est off
        if (autoembed.status == "false") return

        // Conversion des valeurs
        let title = autoembed.titre.toString()
        title = title.replace(/{member.tag}/g, `${message.author.tag}`)
        title = title.replace(/{member.id}/g, `${message.author.id}`)
        title = title.replace(/{guild.name}/g, `${message.guild.name}`)
        title = title.replace(/{guild.id}/g, `${message.guild.id}`)

        let description = autoembed.description.toString()
        description = description.replace(/{member.tag}/g, `${message.author.tag}`)
        description = description.replace(/{member.id}/g, `${message.author.id}`)
        description = description.replace(/{guild.name}/g, `${message.guild.name}`)
        description = description.replace(/{guild.id}/g, `${message.guild.id}`)
        description = description.replace(/;/g, `\n​`)

        let accentColor = null;
        if (autoembed && autoembed.color) {
            const col = autoembed.color.toString().trim();
            if (/^#?[0-9A-Fa-f]{6}$/.test(col)) {
                accentColor = parseInt(col.replace('#', ''), 16);
            } else if (/^0x[0-9A-Fa-f]+$/.test(col)) {
                accentColor = parseInt(col, 16);
            } else if (/^-?\d+$/.test(col)) {
                const n = Number(col);
                if (!Number.isNaN(n)) accentColor = n;
            }
        }

        const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## __${title}__\n\n`),
            new TextDisplayBuilder().setContent(description)
        );
        if (accentColor !== null) container.setAccentColor(accentColor);

        const components = [container];

        const channel = message.channel;
        const messages = await channel.messages.fetch({ limit: 3 });

        messages.forEach(msg => {
            if (msg.author.id === client.user.id) msg.delete();
        });

        await channel.send({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } }).catch(() => { });
    }
}