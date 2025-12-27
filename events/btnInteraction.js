const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {

        if (!interaction.isButton()) return;

        const helpContent = {
            config_helpEN: {
                title: "Configuration help",
                description: `
**Advertising Channels:** /config_pub-channel  
Configure advertising channels, can be category ID.

**Verification Channel:** /config_verif-channel  
Set the verification channel ID.

**Log Channel:** /config_logs-channel  
Set the log channel ID.

**Sanction Channel:** /config_sanction-channel  
Set the channel for sanctions (DM automatic, channel recommended).

**Auto Embed:** /config_auto-embed  
Set title and content of auto-embed under ads. Use ; for line break.`
            },
            config_helpFR: {
                title: "Aide à la configuration",
                description: `
**Channels publicitaires:** /config_pub-channel  
Configurer les channels pub, peut être une catégorie.

**Salon de vérification:** /config_verif-channel  
Mettre l'ID du salon de verification.

**Salon de logs:** /config_logs-channel  
Mettre l'ID du salon pour les logs.

**Salon de sanctions:** /config_sanction-channel  
Mettre l'ID du salon pour annonces de sanction. (MP dans tous les cas, salon recommandé).

**Auto Embed:** /config_auto-embed  
Configurer le titre et contenu de l'embed automatique. Utiliser ; pour un saut de ligne.`
            }
        };

        const content = helpContent[interaction.customId];
        if (!content) return;

        const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## __${content.title}__\n\n`),
            new TextDisplayBuilder().setContent(content.description)
        );

        await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | 64, allowedMentions: { parse: [] } }).catch(() => { });
    }
};
