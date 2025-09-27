const express = require('express');
const router = express.Router();
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /cats - Ottieni TUTTI i gatti
router.get('/', async (req, res) => {
  try {
    const cats = await Cat.find();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /cats - Crea un nuovo gatto CON UPLOAD IMMAGINE
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    // Verifica se è stato caricato un file
    if (!req.file) {
      return res.status(400).json({ message: 'Immagine obbligatoria' });
    }

    const cat = new Cat({
      name: req.body.name,
      description: req.body.description,
      location: {
        lat: req.body.lat,
        lng: req.body.lng
      },
      image: req.file.filename, // Salva il nome del file
      author: req.user._id
    });

    const newCat = await cat.save();
    res.status(201).json(newCat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /cats/:id - Ottieni un gatto per ID
router.get('/:id', async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Gatto non trovato' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /cats/:id - Elimina un gatto
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const cat = await Cat.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Gatto non trovato' });
    res.json({ message: 'Gatto eliminato' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;