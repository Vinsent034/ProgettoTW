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
    console.log('Errore GET /cats:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /cats - Crea un nuovo gatto CON UPLOAD IMMAGINE
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'Immagine obbligatoria',
        error: 'FILE_MISSING'
      });
    }

    console.log('File ricevuto:', req.file.filename);
    console.log('Body:', req.body);

    const { name, description, lat, lng } = req.body;
    
    if (!name || !description || !lat || !lng) {
      return res.status(400).json({
        message: 'Tutti i campi sono obbligatori'
      });
    }

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
    
    if (isNaN(catData.location.lat) || isNaN(catData.location.lng)) {
      return res.status(400).json({
        message: 'Coordinate non valide'
      });
    }

    const cat = new Cat(catData);
    const newCat = await cat.save();
    
    await newCat.populate('author', 'name email');
    
    console.log('Gatto salvato, ID:', newCat._id);
    res.status(201).json(newCat);
    
  } catch (err) {
    console.log('Errore post cats:', err.message);
    res.status(400).json({ 
      message: err.message
    });
  }
});

// GET /cats/:id - Ottieni un gatto per ID
router.get('/:id', async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id).populate('author', 'name email');
    
    if (!cat) {
      return res.status(404).json({ message: 'Gatto non trovato' });
    }
    
    res.json(cat);
    
  } catch (err) {
    console.log('Errore GET /cats/:id:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cats/:id - Elimina un gatto
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);
    
    if (!cat) {
      return res.status(404).json({ message: 'Gatto non trovato' });
    }
    
    // Verifica proprietario
    if (cat.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }
    
    await Cat.findByIdAndDelete(req.params.id);
    console.log('Gatto eliminato:', req.params.id);
    
    res.json({ message: 'Gatto eliminato' });
    
  } catch (err) {
    console.log('Errore DELETE /cats/:id:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;