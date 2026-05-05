const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, time } = require("discord.js");
var loggT = require('../loggerT.js');
var loggE = require('../loggerE.js');
var loggV = require('../loggerV.js')

const db = require("../fonctions/database.js");
const pubs = require("../fonctions/pubsManager.js");
const self = require("../fonctions/antiSelfManager.js")

module.exports = {
    name: 'messageCreate',
    async execute(client, message) {
        if (client.config.id.includes(message.author.id)) return
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
            if (!message.author.bot) {
                message.delete();
                message.author.send('> __**Votre publicité est trop courte... Elle dois contenir au moins 30 caractères**__');
            }
            return
        }

        pubs.createPub(message.content);
        pubs.addUserToPub(message.content, message.author.id);
        pubs.addChannelToUser(message.content, message.author.id, message.channel.id);
        const { value: selfverif, score: scoreVerif } = pubs.getSelfVerif(message.content, message.author.id, message.channel.id);

        await self.initChannel(message.channel)
        
        const know = self.know(message.author.id)
        const knowNotSelf = self.knowNotSelf(message.author.id)

        const hash = self.addPubMessage(message.content, message.channel.id, message.author.id, message.createdTimestamp);

        const selfbotSuspect = !message.author.bot && self.detectSelfbotFromJson(message.author.id, message.channel.id, hash)
        if (knowNotSelf) selfbotSuspect = false
        

        if (selfverif && scoreVerif > 1 && !selfbotSuspect) return message.react('👌');
        if (selfverif && scoreVerif < 1 && !selfbotSuspect) return message.delete();

        if (selfbotSuspect) message.react('<a:redalert:1262160513689714688>')

        loggV(`[ PUB ] ${message.guild.name} / ${message.guild.id} | Publicité envoyée par ${message.author.id} / ${message.author.tag}#${message.author.discriminator} dans ${message.channel.name}`)


        const inviteRegex =  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite|discord\.com\/invite)\/(?<code>[a-zA-Z0-9-]+)/gi;
        const invites = [...message.content.matchAll(inviteRegex)];

        let invitesList = [];

        if (invites.length !== 0) {
            for (const match of invites) {
                const code = match.groups.code;
                const url = "https://discord.gg/" + code;

                let guild = { name: "?" };
                let approx = { members: "?", online: "?" };
                let valid = false;

                try {
                    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true&with_expiration=true`);
                    if (!res.ok) {
                        guild = { name: "Invite invalide" };
                    } else {
                        const data = await res.json();
                        guild = data.guild ?? { name: "Serveur inconnu" };
                        approx = {
                            members: data.approximate_member_count ?? "?",
                            online: data.approximate_presence_count ?? "?",
                        };
                        valid = true;
                    }
                } catch (err) {
                    console.error("Erreur en vérifiant l’invitation :", err);
                    guild = { name: "Erreur API" };
                }
                
                if (invitesList.some(inv => inv.url === url)) continue;
                invitesList.push({ code, url, guild, approx, valid });
            }
        }

        //Si il y a un salon de vérification
        const guilds = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM guilds WHERE guildId = ?`, [message.guild.id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        const verifchannel = guilds.verifchannel

        //Si le salon existe pas
        const channelVerif = client.channels.cache.get(verifchannel);
        if (!channelVerif) return message.reply('> **__<:warning:1454545145650479382> Aucun salon de verification défini ' + client.config.prefix + 'config_verif-channel <:warning:1454545145650479382>__**')

        // Construction de l'embed
        const verifembed = new EmbedBuilder()
            .setTitle("⏳ Nouvelle publicité :")
            .setDescription("\n\n" + message.content + "\n\n")
            .addFields({ name: 'Utilisateur :', value: `<@${message.author.id}> | \`${message.author.username}#${message.author.discriminator}\``, inline: true })
            .addFields({ name: 'Salon :', value: `https://discord.com/channels/${message.guild.id}/${message.channel.id}` + ` | \`${message.channel.name}\``, inline: true })
            .addFields({ name: 'ID de la pub :', value: `${message.id}\n\n_ _`, inline: true })
            .setColor(client.config.color)
            .setFooter({ text: `Merci d'utiliser ${client.user.username} !`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        if (know) verifembed.addFields({ name: '<a:redalert:1262160513689714688> Avertissement <a:redalert:1262160513689714688>', value: '**__Ce membre est marqué comme selfbot !__** Si ce n\'est pas le cas, faites un ticket sur le support *(`/support` ou `' + client.config.prefix + 'support`)*', inline: false})
        else if (selfbotSuspect) verifembed.addFields({ name: '<a:redalert:1262160513689714688> Avertissement <a:redalert:1262160513689714688>', value: '__Pattern régulier détecté__ — __*possible* Selfbot__\nIl est possible de signaler les selfsbots sur le serveur support: ' + client.config.prefix + 'support (ou /support)', inline: false });

        //Construction des boutons
        const buttonVerif = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('valider')
                    .setLabel('Valider')
                    .setEmoji('<a:validate:1454545158388322334>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('refuser')
                    .setLabel('Avertir')
                    .setEmoji('<:warning:1454545145650479382>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('supprimer')
                    .setLabel('Supprimer')
                    .setEmoji('<:X_:1454545141397327903>')
                    .setStyle(ButtonStyle.Secondary)
            )
        const buttonLien = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setLabel('Lien de la publicité')
                .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
                .setStyle(ButtonStyle.Link),
            )

        let replyText = invitesList?.map(inv => {
            if (!inv.valid) return `**Invitation invalide ou périmée :** ${inv.url}`;
            return `_ _\n__Serveur invité :__ ${inv.guild.name}\n` +
                `Lien : \`${inv.url}\`\n` +
                `Membres online : \`${inv.approx.online}/${inv.approx.members}\``;
        }).join("\n");
        verifembed.addFields({ name: 'Invitation(s) trouvée(s) :', value: replyText || "Aucune invitation trouvée", inline: replyText ? false : true });

        const invitesCodes = invitesList?.map(inv => inv.url).join("\n");

        channelVerif.send({ content: invitesCodes ?? "Aucune invitation trouvée", embeds: [verifembed], components: [buttonVerif, buttonLien], allowedMentions: { parse: [] } }).catch(() => { });
        if (!selfbotSuspect) message.react('⌛')
    }
}