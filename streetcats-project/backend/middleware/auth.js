const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        // 1. Estrai il token dall'header Authorization
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Accesso negato. Token mancante.' 
            });
        }

        // 2. Verifica il formato "Bearer <token>"
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Formato token non valido. Usa: Bearer <token>' 
            });
        }

        // 3. Verifica e decodifica il token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_per_sviluppo');
        
        // 4. Cerca l'utente nel database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Token non valido. Utente non trovato.' 
            });
        }

        // 5. Aggiungi l'utente alla request e procedi
        req.user = user;
        next();
        
    } catch (error) {
        // 6. Gestisci errori specifici JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token non valido.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token scaduto. Effettua nuovamente il login.' 
            });
        }

        // 7. Altri errori imprevisti
        console.error('Errore middleware auth:', error);
        res.status(500).json({ 
            error: 'Errore interno del server durante l\'autenticazione.' 
        });
    }
};

module.exports = authenticate;