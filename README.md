# VerifPub Bot

Un bot Discord de vérification et de modération des publicités avec système de sanctions.

⚠️ **IMPORTANT** : Ce projet est sous une licence restrictive qui interdit l'usage commercial. Consultez la section [Restrictions de License](#-restrictions-de-license) pour plus de détails.

## 📋 Fonctionnalités

### ✅ Vérification des Publications
- Vérification automatique des publicités soumises
- Détection des selfbots
- Système de validation/refus avec raisons personnalisées
- Support des notifications en temps réel

### 🛡️ Modération
- Système de sanctions avec traçabilité
- Leaderboard des publicateurs
- Gestion des salons de publicité
- Détection des contenu NSFW
- Blocage des publications violant les ToS

### ⚙️ Configuration
- Configuration des salons de vérification
- Configuration des salons de publicité
- Configuration des salons de sanction
- Configuration de l'auto-embed
- Gestion dynamique du prefix

### 📊 Commandes Utilisateur
- `/ping` - Affiche le ping du bot
- `/help` - Aide à la configuration
- `/prefix` - Affiche le prefix du bot
- `/uptime` - Affiche depuis combien de temps le bot est en ligne
- `/support` - Lien vers le serveur support

### 🔧 Commandes Modération
- `/config_verif-channel` - Configure le salon de vérification
- `/config_pub-channel` - Configure le salon de publicité
- `/config_sanction-channel` - Configure le salon de sanction
- `/config_auto-embed` - Configure l'auto-embed
- `/sanction-list` - Affiche les sanctions d'un utilisateur
- `/sanction-remove` - Retire une sanction
- `/lb-reset` - Réinitialise le leaderboard

## 📦 Installation

### Prérequis
- Node.js v18.0.0 ou supérieur
- Un token Discord bot

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/console-x1/VerifPub.git
cd VerifPub
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration du fichier `index.js`**
Créez un fichier de configuration avec votre token Discord et les IDs nécessaires.

4. **Lancer le bot**
```bash
node index.js
```

## 🗂️ Structure du Projet

```
VerifPub/
├── commands/              # Toutes les commandes du bot
│   ├── bot-perso.js
│   ├── config_*.js       # Commandes de configuration
│   ├── leaderboard.js
│   ├── help.js
│   ├── ping.js
│   ├── prefix.js
│   ├── support.js
│   └── ...
├── events/                # Gestionnaires d'événements
│   ├── messageCreate.js   # Gestion des messages
│   ├── interactionCreate.js  # Gestion des interactions slash
│   ├── verifPub.js        # Logique de vérification
│   ├── verifInteraction.js   # Interactions de vérification
│   ├── sanction.js        # Gestion des sanctions
│   ├── ready.js
│   ├── guildCreate.js
│   └── guildDelete.js
├── fonctions/             # Fonctions utilitaires
│   ├── database.js        # Gestion de la base de données
│   ├── antiSelfManager.js # Détection de selfbots
│   └── pubsManager.js     # Gestion des publicités
├── logs/                  # Fichiers de logs
│   ├── ERROR.txt
│   ├── TEXT.txt
│   └── Verif.txt
├── index.js              # Point d'entrée principal
├── package.json          # Dépendances du projet
└── README.md            # Ce fichier
```

## 🎨 Personnalisation des Emojis

Les emojis utilisés dans le bot sont définis dans les fichiers de commandes et d'événements. Pour personnaliser les emojis, modifiez les codes suivants :

- `<a:redalert:...>` - Alertes rouges
- `<a:validate:...>` - Validation
- `<a:moderator:...>` - Icône modérateur
- `<a:verifyyellow:...>` - Validation jaune
- `<:warning:...>` - Avertissements
- `<:X_:...>` - Erreurs/Rejets

## 📊 Base de Données

Le bot utilise SQLite pour stocker :
- Les utilisateurs et leurs stats
- Les sanctions
- Les salons configurés
- Les publicateurs connus

Les fichiers JSON (`pubs.json`, `selfbot.json`, `anti-self.json`) stockent également des données importantes.

## 🤝 Configuration des Permissions

Le bot nécessite les permissions suivantes :
- ✅ Voir les salons
- ✅ Envoyer des messages
- ✅ Intégrer des liens
- ✅ Ajouter des réactions
- ✅ Gérer les salons
- ✅ Modérer des membres

## 📝 Logs

Les logs sont enregistrés dans le dossier `logs/` :
- `ERROR.txt` - Erreurs du système
- `TEXT.txt` - Logs texte généraux
- `Verif.txt` - Logs de vérification

## ⚠️ Restrictions de License

Ce projet est protégé par une licence personnalisée restrictive. Voici ce que vous pouvez et ne pouvez PAS faire :

### ✅ Autorisé
- Utiliser le bot pour vos serveurs personnels
- Modifier le code pour votre usage personnel/éducatif
- Apprendre et étudier le code

### ❌ Interdit
- **Usage commercial** : Interdiction stricte d'utiliser ce bot à des fins commerciales
- **Revente** : Vous ne pouvez pas revendre ou louer ce bot
- **Hébergement SaaS** : Pas d'hébergement en tant que service ou bot managé
- **Redistribution** : Pas de redistribution du code source ou binaire
- **Monétisation** : Tout usage impliquant une rémunération est interdit

**Toute utilisation commerciale nécessite une license écrite séparée du propriétaire.**

## 📄 License

**License Personnalisée - Tous droits réservés à console-x1 (2025)**

Pour les détails complets, consultez le fichier [LICENSE](LICENSE)

## 👤 Auteur

**console-x1**

## 🔗 Liens

- [Repository GitHub](https://github.com/console-x1/VerifPub)
- [Issues](https://github.com/console-x1/VerifPub/issues)
- [Support Discord](https://discord.gg/4EXvZvGUe5)

## 📋 Changelog

### v1.0.0
- Version initiale avec support complet de la vérification et modération
- Système de sanctions intégré
- Configuration dynamique
- Détection des selfbots
- Leaderboard des publicateurs

---

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub ou contacter le support Discord.
