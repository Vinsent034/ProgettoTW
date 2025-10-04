const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ 
                error: 'Accesso negato. Token mancante.' 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Formato token non valido. Usa: Bearer <token>' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_per_sviluppo');
        
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Token non valido. Utente non trovato.' 
            });
        }

        req.user = user;
        next();
        
    } catch (error) {
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

        console.log('Errore auth:', error.message);
        res.status(500).json({ 
            error: 'Errore interno del server' 
        });
    }
};

module.exports = authenticate;