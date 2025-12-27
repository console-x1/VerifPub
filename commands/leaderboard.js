const { SlashCommandBuilder, PermissionsBitField, PermissionFlagsBits, TextDisplayBuilder, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require("discord.js");
const db = require("../fonctions/database.js");

module.exports = {
    name: "leaderboard",
    description: "📜 Permet la visualisation des points publicitaires.",
    aliases: ["lb", "leaderboard-show", "lb-show", "top", "top-lb", "classment"],
    permissions: [PermissionsBitField.Flags.UseApplicationCommands],
    guildOwnerOnly: false,
    botOwnerOnly: false,

    async execute(client, message, args) {
        const data = await new Promise((resolve, reject) => {
            db.all(
                `SELECT userId, lb FROM users WHERE guildId = ? AND lb != 0 ORDER BY lb DESC LIMIT 15`,
                [message.guild.id],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });

        const leaderboard = data.map((row, i) => {
            let position;
            switch (i) {
                case 0: position = "<:level7:1414072215854387220>"; break;
                case 1: position = "<:level6:1414072212125650955>"; break;
                case 2: position = "<:level5:1414072209546154046>"; break;
                case 3: position = "<:level4:1414072207570632815>"; break;
                case 4: position = "<:level3:1414072205188403251>"; break;
                case 5: position = "<:level2:1414072202739060767>"; break;
                case 6: position = "<:level1:1414072201279312074>"; break;
                case 7: position = "<:fire:1414072120819974214>"; break;
                case 8: position = "<:fire_3:1414072125756801105>"; break;
                case 9: position = "<:fire_4:1414072127413420183>"; break;
                default: position = `**${i + 1}.**`;
            }
            return `${position} <@${row.userId}> - \`${row.lb}\``;
        }).join("\n\n");

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:trophy:1414072507702575215> Voici le top des verifications publicitaires :\n\n${leaderboard}`)
            )
        ];

        await message.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    async executeSlash(client, interaction) {
        const data = await new Promise((resolve, reject) => {
            db.all(
                `SELECT userId, lb FROM users WHERE guildId = ? AND lb != 0 ORDER BY lb DESC LIMIT 15`,
                [interaction.guild.id],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });

        const leaderboard = data.map((row, i) => {
            let position;
            switch (i) {
                case 0: position = "<:level7:1414072215854387220>"; break;
                case 1: position = "<:level6:1414072212125650955>"; break;
                case 2: position = "<:level5:1414072209546154046>"; break;
                case 3: position = "<:level4:1414072207570632815>"; break;
                case 4: position = "<:level3:1414072205188403251>"; break;
                case 5: position = "<:level2:1414072202739060767>"; break;
                case 6: position = "<:level1:1414072201279312074>"; break;
                case 7: position = "<:fire:1414072120819974214>"; break;
                case 8: position = "<:fire_3:1414072125756801105>"; break;
                case 9: position = "<:fire_4:1414072127413420183>"; break;
                default: position = `**${i + 1}.**`;
            }
            return `${position} <@${row.userId}> - \`${row.lb}\``;
        }).join("\n\n");

        const components = [
            new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`<:trophy:1414072507702575215> Voici le top des verifications publicitaires :\n\n${leaderboard}`)
            )
        ];

        await interaction.reply({ components, flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    },

    get data() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDefaultMemberPermissions(PermissionFlagsBits.UseApplicationCommands);
    }
};
