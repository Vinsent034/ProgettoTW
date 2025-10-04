const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /cats - Ottieni TUTTI i gatti
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /cats - Recupero lista gatti');
    const cats = await Cat.find().populate('author', 'name email');
    console.log(`✅ Trovati ${cats.length} gatti`);
    res.json(cats);
  } catch (err) {
    console.error('❌ Errore GET /cats:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /cats - Crea un nuovo gatto CON UPLOAD IMMAGINE
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 POST /cats - NUOVA RICHIESTA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // 1. VERIFICA FILE
    console.log('1️⃣ Verifica file...');
    if (!req.file) {
      console.log('❌ File immagine mancante!');
      return res.status(400).json({ 
        message: 'Immagine obbligatoria',
        error: 'FILE_MISSING'
      });
    }
    console.log('✅ File ricevuto:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // 2. VERIFICA DATI
    console.log('\n2️⃣ Verifica dati ricevuti...');
    console.log('Body completo:', req.body);
    console.log('User autenticato:', {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });

    const { name, description, lat, lng } = req.body;
    
    // Validazione campi
    if (!name || !description || !lat || !lng) {
      console.log('❌ Campi mancanti:', {
        name: !!name,
        description: !!description,
        lat: !!lat,
        lng: !!lng
      });
      return res.status(400).json({
        message: 'Tutti i campi sono obbligatori',
        missing: {
          name: !name,
          description: !description,
          lat: !lat,
          lng: !lng
        }
      });
    }

    // 3. CREA OGGETTO GATTO
    console.log('\n3️⃣ Creazione oggetto gatto...');
    const catData = {
      name: name.trim(),
      description: description.trim(),
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      },
      image: req.file.filename,
      author: req.user._id
    };
    
    console.log('Dati gatto:', catData);
    
    // Verifica coordinate valide
    if (isNaN(catData.location.lat) || isNaN(catData.location.lng)) {
      console.log('❌ Coordinate non valide:', { lat, lng });
      return res.status(400).json({
        message: 'Coordinate non valide',
        received: { lat, lng }
      });
    }

    // 4. SALVA NEL DATABASE
    console.log('\n4️⃣ Salvataggio nel database...');
    const cat = new Cat(catData);
    
    const newCat = await cat.save();
    console.log('✅ Gatto salvato! ID:', newCat._id);
    
    // 5. POPOLA E RESTITUISCI
    console.log('\n5️⃣ Popolamento author...');
    await newCat.populate('author', 'name email');
    
    console.log('✅ Risposta finale:', {
      _id: newCat._id,
      name: newCat.name,
      image: newCat.image,
      author: newCat.author
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ POST /cats COMPLETATO CON SUCCESSO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(201).json(newCat);
    
  } catch (err) {
    console.error('\n❌❌❌ ERRORE POST /cats ❌❌❌');
    console.error('Tipo errore:', err.name);
    console.error('Messaggio:', err.message);
    console.error('Stack:', err.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(400).json({ 
      message: err.message,
      error: err.name,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// GET /cats/:id - Ottieni un gatto per ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`📋 GET /cats/${req.params.id}`);
    
    const cat = await Cat.findById(req.params.id).populate('author', 'name email');
    
    if (!cat) {
      console.log('❌ Gatto non trovato');
      return res.status(404).json({ message: 'Gatto non trovato' });
    }
    
    console.log('✅ Gatto trovato:', cat.name);
    res.json(cat);
    
  } catch (err) {
    console.error('❌ Errore GET /cats/:id:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cats/:id - Elimina un gatto
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log(`🗑️ DELETE /cats/${req.params.id} da user ${req.user._id}`);
    
    const cat = await Cat.findById(req.params.id);
    
    if (!cat) {
      console.log('❌ Gatto non trovato');
      return res.status(404).json({ message: 'Gatto non trovato' });
    }
    
    // Verifica proprietario
    if (cat.author.toString() !== req.user._id.toString()) {
      console.log('❌ Non autorizzato:', {
        catAuthor: cat.author.toString(),
        userId: req.user._id.toString()
      });
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    await Cat.findByIdAndDelete(req.params.id);
    console.log('✅ Gatto eliminato');
    
    res.json({ message: 'Gatto eliminato' });
    
  } catch (err) {
    console.error('❌ Errore DELETE /cats/:id:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;