const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /cats - Ottieni TUTTI i gatti
router.get('/', async (req, res) => {
  try {
    console.log('Richiesta GET /cats ricevuta');
    const cats = await Cat.find().populate('author', 'name email');
    console.log(`Trovati ${cats.length} gatti`);
    res.json(cats);
  } catch (err) {
    console.error('Errore GET /cats:', err);
    res.status(500).json({ error: 'Errore nel caricamento gatti', details: err.message });
  }
});

// POST /cats - Crea un nuovo gatto CON UPLOAD IMMAGINE
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('=== INIZIO POST /cats ===');
    console.log('Body ricevuto:', req.body);
    console.log('File ricevuto:', req.file);
    console.log('User autenticato:', req.user ? req.user._id : 'NESSUNO');

    // ✅ CORREZIONE: Verifica se è stato caricato un file
    if (!req.file) {
      console.error('❌ Nessun file immagine ricevuto');
      return res.status(400).json({ error: 'Immagine obbligatoria' });
    }

    // ✅ CORREZIONE: Validazione dati obbligatori
    const { name, description, lat, lng } = req.body;
    
    if (!name || !description || !lat || !lng) {
      console.error('❌ Dati mancanti:', { name: !!name, description: !!description, lat: !!lat, lng: !!lng });
      return res.status(400).json({ 
        error: 'Tutti i campi sono obbligatori', 
        missing: {
          name: !name,
          description: !description,
          lat: !lat,
          lng: !lng
        }
      });
    }

    // ✅ CORREZIONE: Validazione coordinate
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('❌ Coordinate non valide:', { lat, lng });
      return res.status(400).json({ error: 'Coordinate non valide' });
    }

    // Crea il nuovo gatto
    const cat = new Cat({
      name: name.trim(),
      description: description.trim(),
      location: {
        lat: latitude,
        lng: longitude
      },
      image: req.file.filename, // Salva solo il nome del file
      author: req.user._id
    });

    console.log('Gatto da salvare:', cat);

    const newCat = await cat.save();
    console.log('✅ Gatto salvato con successo:', newCat._id);

    // Popola author per la risposta
    await newCat.populate('author', 'name email');

    res.status(201).json({
      message: 'Gatto aggiunto con successo',
      cat: newCat
    });

  } catch (err) {
    console.error('❌ Errore POST /cats:', err);
    
    // Gestione errori specifici
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Errori di validazione', 
        details: errors 
      });
    }
    
    res.status(500).json({ 
      error: 'Errore interno del server', 
      details: err.message 
    });
  }
});

// GET /cats/:id - Ottieni un gatto per ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Richiesta GET /cats/:id per ID:', req.params.id);
    
    const cat = await Cat.findById(req.params.id).populate('author', 'name email');
    
    if (!cat) {
      console.log('❌ Gatto non trovato per ID:', req.params.id);
      return res.status(404).json({ error: 'Gatto non trovato' });
    }
    
    console.log('✅ Gatto trovato:', cat.name);
    res.json(cat);
    
  } catch (err) {
    console.error('❌ Errore GET /cats/:id:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'ID non valido' });
    }
    
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// DELETE /cats/:id - Elimina un gatto (solo l'autore)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('Richiesta DELETE /cats/:id per ID:', req.params.id);
    console.log('User che richiede:', req.user._id);
    
    const cat = await Cat.findById(req.params.id);
    
    if (!cat) {
      return res.status(404).json({ error: 'Gatto non trovato' });
    }
    
    // ✅ CONTROLLO: Solo l'autore può cancellare
    if (cat.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questo gatto' });
    }
    
    await Cat.findByIdAndDelete(req.params.id);
    console.log('✅ Gatto eliminato:', req.params.id);
    
    res.json({ message: 'Gatto eliminato con successo' });
    
  } catch (err) {
    console.error('❌ Errore DELETE /cats/:id:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;