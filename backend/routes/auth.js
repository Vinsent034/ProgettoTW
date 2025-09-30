const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // ✅ Importa il modello User (da creare)

const router = express.Router();

// REGISTRAZIONE
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Tutti i campi sono obbligatori.' });
    }

    try {
        // Controlla se l'email esiste già (con Mongoose)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email già registrata.' });
        }

        // Cripta la password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea un nuovo utente con Mongoose
        const newUser = new User({
            email,
            password: hashedPassword,
            name
        });

        // Salva l'utente nel database
        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'Utente registrato con successo',
            userId: savedUser._id // ✅ MongoDB usa _id invece di id
        });

    } catch (error) {
        res.status(500).json({ error: 'Errore del server' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password obbligatorie.' });
    }

    try {
        // Cerca l'utente per email (con Mongoose)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        // Confronta la password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        // Genera il token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_per_sviluppo',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login effettuato con successo',
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Errore del server' });
    }
});

module.exports = router;