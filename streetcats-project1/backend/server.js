require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const catRoute = require('./routes/cats');
const authRoute = require('./routes/auth');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

console.log('🚀 Avvio StreetCats Server...');
console.log('📍 Porta:', PORT);
console.log('🗄️  MongoDB URI:', MONGODB_URI ? 'Configurato ✅' : 'MANCANTE ❌');

const app = express();

// ✅ MIDDLEWARE CONFIGURATI CORRETTAMENTE
app.use(cors({
    origin: function (origin, callback) {
        // ... nuovo codice CORS
    }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ DEBUG MIDDLEWARE - Log tutte le richieste
app.use((req, res, next) => {
    console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('📄 Body:', req.body);
        console.log('📎 Files:', req.files || req.file ? 'Presenti' : 'Nessuno');
    }
    next();
});

// Connessione a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connesso a MongoDB Cloud!');
    })
    .catch(err => {
        console.error('❌ Errore di connessione MongoDB:', err);
        process.exit(1);
    });

// ✅ CORREZIONE: Crea cartella uploads se non esiste
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Cartella uploads creata');
} else {
    console.log('📁 Cartella uploads esistente');
}

// Servi file statici dalla cartella 'uploads'
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/cats', catRoute);
app.use('/auth', authRoute);

// Route principale con debug
app.get('/', (req, res) => {
    console.log('📋 Richiesta homepage ricevuta');
    res.json({
        message: 'StreetCats API Server',
        version: '1.0.0',
        endpoints: {
            cats: '/cats',
            auth: '/auth',
            uploads: '/uploads'
        },
        status: 'running'
    });
});

// ✅ GESTIONE ERRORI GLOBALE
app.use((error, req, res, next) => {
    console.error('❌ Errore globale:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            error: 'File troppo grande. Massimo 5MB consentiti.' 
        });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            error: 'Formato file non supportato.' 
        });
    }
    
    res.status(500).json({ 
        error: 'Errore interno del server',
        message: error.message
    });
});

// ✅ GESTIONE 404
app.use((req, res) => {
    console.log(`❓ Route non trovata: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Route non trovata',
        availableRoutes: ['/cats', '/auth', '/uploads']
    });
});

// Avvio server
app.listen(PORT, () => {
    console.log('\n🎉 StreetCats Server avviato con successo!');
    console.log(`🌍 Server: http://localhost:${PORT}`);
    console.log(`📝 Registrazione: http://localhost:${PORT}/auth/register`);
    console.log(`🔐 Login: http://localhost:${PORT}/auth/login`);
    console.log(`🐱 Gatti: http://localhost:${PORT}/cats`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    console.log('\n🔍 Per debug, controlla i log qui sopra quando fai richieste');
});