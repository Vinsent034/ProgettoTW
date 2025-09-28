const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTRAZIONE con DEBUG COMPLETO
router.post('/register', async (req, res) => {
    console.log('\n=== INIZIO REGISTRAZIONE ===');
    console.log('📄 Body ricevuto:', req.body);
    console.log('📍 Headers:', req.headers);
    
    const { email, password, name } = req.body;

    // Validazione input dettagliata
    console.log('🔍 Validazione campi:');
    console.log('- Name:', name, '(presente:', !!name, ')');
    console.log('- Email:', email, '(presente:', !!email, ')');
    console.log('- Password: (presente:', !!password, ', lunghezza:', password?.length || 0, ')');

    if (!email || !password || !name) {
        console.log('❌ Campi mancanti:', { email: !!email, password: !!password, name: !!name });
        return res.status(400).json({ error: 'Tutti i campi sono obbligatori.' });
    }

    try {
        console.log('🔍 Controllo se utente esiste già...');
        console.log('📧 Email da cercare:', email.trim().toLowerCase());
        
        // Controlla se utente esiste
        const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
        console.log('👤 Utente esistente:', existingUser ? 'SÌ (ID: ' + existingUser._id + ')' : 'NO');
        
        if (existingUser) {
            console.log('❌ Email già registrata:', email);
            return res.status(400).json({ error: 'Email già registrata.' });
        }

        console.log('🔐 Inizio hash della password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Password hashata (lunghezza:', hashedPassword.length, ')');

        console.log('💾 Preparazione nuovo utente...');
        const userData = {
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            name: name.trim()
        };
        console.log('📋 Dati utente preparati:', {
            email: userData.email,
            name: userData.name,
            passwordLength: userData.password.length
        });

        const newUser = new User(userData);
        console.log('🏗️  Oggetto User creato');

        console.log('📝 Salvataggio utente nel database...');
        const savedUser = await newUser.save();
        console.log('✅ Utente salvato con successo!');
        console.log('🆔 ID assegnato:', savedUser._id);
        console.log('📧 Email salvata:', savedUser.email);
        console.log('👤 Nome salvato:', savedUser.name);

        console.log('✅ REGISTRAZIONE COMPLETATA CON SUCCESSO');
        res.status(201).json({
            message: 'Utente registrato con successo',
            userId: savedUser._id
        });

    } catch (error) {
        console.error('\n❌ ERRORE DURANTE REGISTRAZIONE:');
        console.error('📝 Messaggio:', error.message);
        console.error('🏷️  Nome errore:', error.name);
        console.error('📚 Stack:', error.stack);
        
        if (error.name === 'ValidationError') {
            console.error('🚫 Errori di validazione specifici:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
            return res.status(400).json({ 
                error: 'Dati non validi', 
                details: Object.values(error.errors).map(e => e.message)
            });
        }
        
        if (error.code === 11000) {
            console.error('🔄 Errore duplicato (email già esistente)');
            return res.status(400).json({ error: 'Email già registrata.' });
        }
        
        res.status(500).json({ 
            error: 'Errore del server durante la registrazione',
            details: error.message 
        });
    }
});

// LOGIN con DEBUG COMPLETO
router.post('/login', async (req, res) => {
    console.log('\n=== INIZIO LOGIN ===');
    console.log('📄 Body ricevuto:', req.body);
    
    const { email, password } = req.body;

    console.log('🔍 Validazione campi login:');
    console.log('- Email:', email, '(presente:', !!email, ')');
    console.log('- Password: (presente:', !!password, ', lunghezza:', password?.length || 0, ')');

    if (!email || !password) {
        console.log('❌ Campi mancanti per login');
        return res.status(400).json({ error: 'Email e password obbligatorie.' });
    }

    try {
        console.log('🔍 Ricerca utente nel database...');
        console.log('📧 Email da cercare:', email.trim().toLowerCase());
        
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        console.log('👤 Utente trovato:', user ? 'SÌ (ID: ' + user._id + ')' : 'NO');
        
        if (!user) {
            console.log('❌ Utente non trovato per email:', email);
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        console.log('🔐 Verifica password...');
        console.log('🗝️  Password da confrontare con hash nel DB...');
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔑 Password valida:', isPasswordValid ? 'SÌ' : 'NO');
        
        if (!isPasswordValid) {
            console.log('❌ Password errata per utente:', user.email);
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        console.log('🎫 Generazione token JWT...');
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_per_sviluppo';
        console.log('🔐 JWT Secret presente:', !!jwtSecret);
        
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            jwtSecret,
            { expiresIn: '1h' }
        );
        console.log('✅ Token JWT generato (lunghezza:', token.length, ')');

        const responseData = {
            message: 'Login effettuato con successo',
            token,
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            }
        };

        console.log('📤 Risposta da inviare:', {
            message: responseData.message,
            hasToken: !!responseData.token,
            user: responseData.user
        });

        console.log('✅ LOGIN COMPLETATO CON SUCCESSO');
        res.json(responseData);

    } catch (error) {
        console.error('\n❌ ERRORE DURANTE LOGIN:');
        console.error('📝 Messaggio:', error.message);
        console.error('🏷️  Nome errore:', error.name);
        console.error('📚 Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Errore del server durante il login',
            details: error.message 
        });
    }
});

module.exports = router;