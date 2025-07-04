# LinkDruid - Gestionnaire de Liens
LinkDruid est une application web simple et personnelle pour gérer, organiser et visualiser vos marque-pages (liens). Elle fonctionne localement grâce à un serveur Node.js et stocke toutes vos données directement dans le `localStorage` de votre navigateur, offrant une solution rapide, privée et entièrement sous votre contrôle.

Le serveur back-end est principalement utilisé pour servir les fichiers de l'application et pour une fonctionnalité clé : le traitement (redimensionnement) des images que vous téléversez pour vos liens.

![image](https://github.com/user-attachments/assets/3d47806e-cf9a-4afd-a1f7-31696308efce)

## Fonctionnalités

![image](https://github.com/user-attachments/assets/a3ec9aa4-c1f1-4cba-aa06-2205368f570f)

### Gestion des Liens
*   **Ajouter, modifier et supprimer** des liens.
*   Chaque lien peut avoir un **titre, une URL, une description et des tags**.
*   Associer chaque lien à une **catégorie** spécifique.
*   Recherche puissante permettant de filtrer par **titre, description et tags**.
*   Possibilité de trier les liens par ordre alphabétique (A-Z ou Z-A).

### Organisation par Catégories
*   Créez, renommez et supprimez des catégories pour organiser vos liens.
*   Une page de **réglages dédiée** pour gérer toutes vos catégories.
*   **Épinglez** vos catégories favorites pour qu'elles apparaissent en haut de la liste.
*   Associez une **icône personnalisée** à chaque catégorie depuis une bibliothèque d'icônes locale.

### Personnalisation Visuelle
*   Pour chaque lien, choisissez une représentation visuelle :
    1.  **Téléversez une image personnalisée** : Le serveur la redimensionnera automatiquement en une miniature carrée (512x512px) et l'enregistrera dans le dossier `img/`.
    2.  **Choisissez une icône** depuis une bibliothèque locale (le contenu du dossier `imgfix/`).
    3.  Si aucune image n'est définie, **l'icône de la catégorie** du lien sera utilisée par défaut.
*   La modale de sélection d'icônes inclut des options de recherche, de tri et de redimensionnement de l'aperçu pour trouver facilement l'icône parfaite.

### Gestion des Données
*   **Stockage Local** : Toutes les données (liens et catégories) sont sauvegardées dans le `localStorage` de votre navigateur. Pas de base de données externe requise.
*   **Exporter Tout** : Sauvegardez l'intégralité de votre configuration (liens et catégories) dans un unique fichier `.json`.
*   **Exporter par Catégorie** : Exportez une seule catégorie et tous les liens qu'elle contient.
*   **Importer une Configuration** : Chargez un fichier `.json` pour ajouter ou fusionner des liens et catégories à votre configuration existante.
*   **Charger une Configuration Locale** : Placez des fichiers de configuration `.json` dans le dossier `config/` du serveur pour pouvoir les charger directement depuis l'interface.
*   **Réinitialisation Totale** : Supprimez toutes les données de l'application en un seul clic.

## Installation

Suivez ces étapes pour lancer l'application sur votre machine.

### 1. Prérequis
*   Vous devez avoir [Node.js](https://nodejs.org/) (version 18 ou supérieure) installé sur votre ordinateur.

### 2. Installation
1.  Téléchargez ou clonez ce projet sur votre machine.
2.  Ouvrez un terminal ou une invite de commande et naviguez jusqu'au répertoire racine du projet.
3.  Exécutez la commande suivante pour installer les dépendances nécessaires (Express, Sharp, Multer, etc.) :
    ```bash
    npm install
    ```

### 3. Structure des Dossiers
Avant de lancer le serveur, vous pouvez préparer les dossiers suivants à la racine du projet (s'ils n'existent pas, le serveur les créera au premier lancement) :

*   `img/` : Ce dossier est géré automatiquement. Il contiendra les miniatures des images que vous téléverserez pour vos liens.
*   `imgfix/` : **Placez ici toutes les images (`.png`, `.jpg`, `.svg`...) que vous souhaitez utiliser comme icônes** pour vos catégories ou vos liens. C'est votre bibliothèque d'icônes personnelle.
*   `config/` : Si vous avez des configurations de liens/catégories que vous souhaitez charger rapidement, placez les fichiers `.json` correspondants dans ce dossier.

### 4. Lancement du Serveur
Une fois les dépendances installées, lancez le serveur avec la commande :
```bash
node server.js
```
*Alternative pour Windows :* Vous pouvez également double-cliquer sur le fichier `start_linkdruid.bat` pour lancer le serveur.

Le terminal devrait afficher un message confirmant que le serveur a démarré, généralement sur le port 3000.
```
Serveur LinkDruid démarré sur http://localhost:3000
...
```

### 5. Accès à l'Application
Ouvrez votre navigateur web et rendez-vous à l'adresse suivante :
[**http://localhost:3000**](http://localhost:3000)

Vous pouvez maintenant commencer à ajouter vos liens et à organiser vos catégories !

### 🌟 **Soutenez le projet**

Si ce projet vous a été utile, pensez à lui laisser une ⭐ sur GitHub !

**Fait avec ❤️ pour la communauté open source**  
**par Orion4D**

[![Offrez-moi un café](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/orion4d)

</div>

