const multer = require('multer');
const path = require('path');
const fs = require('fs'); // ✅ AGGIUNGI QUESTA RIGA!

// Configurazione dello storage per multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/');
    
    // Crea la cartella se non esiste
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    console.log('Salvando in:', uploadPath); // ← DEBUG
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // AGGIUNGI ANCHE QUESTA PARTE CHE MANCA!
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro per accettare solo immagini
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo immagini sono consentite!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite a 5MB
  }
});

module.exports = upload;