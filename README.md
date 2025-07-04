# LinkDruid

_Gérez vos liens comme un·e druide dompterait une forêt d’URLs._

LinkDruid est une application web (HTML + Tailwind + Vanilla JS côté client, Node/Express côté serveur) qui permet de **classer, tagguer et illustrer vos liens** de façon ultra-rapide, hors-ligne et auto-hébergée.

## ✨ Fonctionnalités

| Bloc | Détail |
|------|--------|
| **Gestion des liens** | • Ajout/édition de liens avec titre, description, tags <br/> • Upload d’image ou choix d’une icône <br/> • Tri alphabétique et recherche instantanée |
| **Catégories intelligentes** | • Création, renommage, suppression, épinglage <br/> • Couleur & icône spécifiques <br/> • Catégorie principale “À classer” toujours présente (logique forcée dans le code) :contentReference[oaicite:0]{index=0} |
| **Tags globaux** | • Vue « Tous les tags » pour filtrer, multi-sélection (Ctrl/Cmd) |
| **Bibliothèque d’icônes** | • Dossier `imgfix/` scanné via l’endpoint `GET /api/available-icons` pour enrichir les catégories :contentReference[oaicite:1]{index=1} |
| **Upload et miniatures** | • Endpoint `POST /upload` qui redimensionne l’image à 512 px max avec Sharp avant de la sauver dans `img/` :contentReference[oaicite:2]{index=2} |
| **Fichiers de configuration** | • Endpoint `GET /api/available-configs` pour lister vos presets JSON (export/import futurs) :contentReference[oaicite:3]{index=3} |
| **Serveur statique** | • Express sert automatiquement le front et les répertoires `img/`, `imgfix/`, `config/` |

## 🗂 Arborescence
├── index.html # Tableau de bord principal
├── add.html # Formulaire d’ajout/édition de lien
├── categories.html # Centre de gestion des catégories
├── app.js # Logique front (localStorage + UI)
├── server.js # API + serveur de fichiers statiques
├── img/ # Miniatures générées
├── imgfix/ # Bibliothèque d’icônes
├── config/ # (Optionnel) exports JSON
├── package.json
└── start_linkdruid.bat # Lancement Windows rapide


## ⚙️ Pré-requis

* **Node.js >= 18** (Sharp requiert une version récente)
* npm (fourni avec Node)
* (Optionnel) Git pour cloner le dépôt

## 🚀 Installation

```bash
# 1. Cloner le repo
git clone https://github.com/<ton-compte>/linkdruid.git
cd linkdruid

# 2. Installer les dépendances
npm install

# 3. (Facultatif) ajouter un script de démarrage propre
npm set-script start "node server.js"

# Démarrer en local
npm start      # ou: node server.js

### Sous Windows
Vous pouvez simplement **double-cliquer** sur `start_linkdruid.bat`.

Le script :
1. installe les dépendances si `node_modules/` est absent ;
2. lance le serveur dans une console dédiée ;
3. ouvre aussitôt votre navigateur sur <http://localhost:3000>.

> Pour arrêter l’appli : fermez la fenêtre « LinkDruid Server Process ».



