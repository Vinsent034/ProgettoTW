const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /cats - Ottieni TUTTI i gatti
router.get('/', async (req, res) => {
  try {
    const cats = await Cat.find().populate('author', 'name email');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /cats - Crea un nuovo gatto CON UPLOAD IMMAGINE
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Immagine obbligatoria' });
    }

    console.log('Dati ricevuti:', req.body);
    console.log('File ricevuto:', req.file);
    console.log('User ID:', req.user._id);

    const cat = new Cat({
      name: req.body.name,
      description: req.body.description,
      location: {
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng)
      },
      image: req.file.filename,
      author: req.user._id
    });

    const newCat = await cat.save();
    
    // Popola l'author prima di restituire
    await newCat.populate('author', 'name email');
    
    console.log('Gatto salvato:', newCat);
    res.status(201).json(newCat);
    
  } catch (err) {
    console.error('Errore salvataggio gatto:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET /cats/:id - Ottieni un gatto per ID
router.get('/:id', async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id).populate('author', 'name email');
    if (!cat) return res.status(404).json({ message: 'Gatto non trovato' });
    
    // 👇 AGGIUNGI QUESTA CONVERSIONE per compatibilità frontend
    const catResponse = cat.toObject();
    if (catResponse.author && catResponse.author._id) {
      catResponse.author = catResponse.author._id.toString();
    }
    
    res.json(catResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cats/:id - Elimina un gatto
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Gatto non trovato' });
    
    // Verifica che l'utente sia il proprietario
    if (cat.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    await Cat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gatto eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;