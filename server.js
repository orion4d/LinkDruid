const express  = require("express");
const multer   = require("multer"); 
const sharp    = require("sharp");   
const path     = require("path");    
const fs       = require("fs");      
const cors     = require("cors");

const app = express();
const PORT = 3000;

// 1) CORS
app.use(cors());

// 2) Servir statiquement la racine (HTML, CSS, JS client)
app.use(express.static(__dirname)); 

// 3) Configuration Multer pour upload images de liens
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 4) Création des dossiers img, imgfix, et config s'ils n'existent pas
const imgDir    = path.join(__dirname, "img");     
const imgFixDir = path.join(__dirname, "imgfix");  
const configDir = path.join(__dirname, "config"); // Nouveau dossier config

if (!fs.existsSync(imgDir)) {
  console.log(`Création dossier miniatures liens: ${imgDir}`);
  fs.mkdirSync(imgDir, { recursive: true }); 
}
if (!fs.existsSync(imgFixDir)) {
  console.log(`Création dossier bibliothèque icônes: ${imgFixDir}`);
  fs.mkdirSync(imgFixDir, { recursive: true });
}
if (!fs.existsSync(configDir)) {
  console.log(`Création dossier configurations: ${configDir}`);
  fs.mkdirSync(configDir, { recursive: true });
}

// 5) Endpoint POST /upload (pour images de liens)
app.post("/upload", upload.single("imageFile"), async (req, res) => {
  console.log("[POST /upload] Requête reçue.");
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e6);
    const filename = `mini_link_${uniqueSuffix}.jpg`; 
    const filepath = path.join(imgDir, filename);
    console.log(`[POST /upload] Traitement: ${req.file.originalname} -> ${filename}`);
    await sharp(req.file.buffer)
      .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(filepath);
    console.log(`[POST /upload] Sauvegardé: ${filepath}`);
    res.json({ miniUrl: `img/${filename}` }); 
  } catch (err) {
    console.error("[POST /upload] Erreur: ", err);
    res.status(500).json({ error: "Erreur serveur lors création thumbnail." });
  }
});

// 6) Endpoint GET /api/available-icons (pour icônes de imgfix/)
app.get("/api/available-icons", (req, res) => {
  console.log(`[GET /api/available-icons] Requête pour: ${imgFixDir}`);
  fs.readdir(imgFixDir, (err, files) => {
    if (err) {
      console.error("[GET /api/available-icons] Erreur lecture imgfix:", err);
      if (err.code === 'ENOENT') return res.status(404).json({ error: "Dossier imgfix non trouvé." });
      return res.status(500).json({ error: "Impossible de lister les icônes." });
    }
    const imageFiles = files.filter(file => !file.startsWith('.') && /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(file.toLowerCase()));
    console.log(`[GET /api/available-icons] Icônes trouvées: ${imageFiles.length}`);
    res.json(imageFiles); 
  });
});

// 7) NOUVEL Endpoint GET /api/available-configs (pour fichiers JSON dans config/)
app.get("/api/available-configs", (req, res) => {
  console.log(`[GET /api/available-configs] Requête pour: ${configDir}`);
  if (!fs.existsSync(configDir)) {
      console.warn("[GET /api/available-configs] Dossier 'config' non trouvé, renvoi tableau vide.");
      return res.json([]); 
  }
  fs.readdir(configDir, (err, files) => {
    if (err) {
      console.error("[GET /api/available-configs] Erreur lecture config:", err);
      return res.status(500).json({ error: "Impossible de lister les configurations." });
    }
    const jsonFiles = files.filter(file => file.toLowerCase().endsWith('.json') && !file.startsWith('.'));
    console.log(`[GET /api/available-configs] Configurations trouvées: ${jsonFiles.length}`);
    res.json(jsonFiles);
  });
});

// 8) Servir statiquement les dossiers img/, imgfix/, et config/
app.use("/img", express.static(imgDir));
app.use("/imgfix", express.static(imgFixDir));
app.use("/config", express.static(configDir)); // NOUVEAU pour servir les fichiers JSON de config

// 9) Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur LinkDruid démarré sur http://localhost:${PORT}`);
  console.log(`Dossier racine servi: ${__dirname}`);
  console.log("Miniatures liens (upload):", imgDir);
  console.log("Bibliothèque icônes (catégories):", imgFixDir);
  console.log("Fichiers de configuration:", configDir);
  console.log("API icônes: /api/available-icons");
  console.log("API configurations: /api/available-configs");
});