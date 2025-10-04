const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Cat = require('../models/Cat');
const authenticate = require('../middleware/auth');

// GET /comments/:catId - Ottieni tutti i commenti di un gatto
router.get('/:catId', async (req, res) => {
  try {
    const comments = await Comment.find({ cat: req.params.catId })
      .populate('author', 'name email')
      .sort({ date: -1 });
    
    res.json(comments);
    
  } catch (err) {
    console.log('Errore caricamento commenti:', err.message);
    res.status(500).json({ message: 'Errore nel caricamento dei commenti' });
  }
});

// POST /comments/:catId - Aggiungi un commento (solo autenticati)
router.post('/:catId', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Il testo del commento è obbligatorio' });
    }
    
    // Verifica che il gatto esista
    const cat = await Cat.findById(req.params.catId);
    if (!cat) {
      return res.status(404).json({ message: 'Gatto non trovato' });
    }
    
    const comment = new Comment({
      text: text.trim(),
      author: req.user._id,
      cat: req.params.catId
    });
    
    const savedComment = await comment.save();
    
    // Popola l'author prima di restituire
    await savedComment.populate('author', 'name email');
    
    console.log('Commento salvato da', req.user.name);
    res.status(201).json(savedComment);
    
  } catch (err) {
    console.log('Errore salvataggio commento:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// DELETE /comments/:commentId - Elimina un commento (solo autore)
router.delete('/:commentId', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato' });
    }
    
    // Verifica che l'utente sia l'autore del commento
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non sei autorizzato a eliminare questo commento' });
    }
    
    await Comment.findByIdAndDelete(req.params.commentId);
    
    res.json({ message: 'Commento eliminato con successo' });
    
  } catch (err) {
    console.log('Errore eliminazione commento:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;