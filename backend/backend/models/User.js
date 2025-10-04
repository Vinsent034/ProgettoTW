const mongoose = require('mongoose');

// Definizione dello schema per l'utente
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email obbligatoria'], // Campo obbligatorio con messaggio personalizzato
        unique: true, // Impedisce email duplicate
        lowercase: true, // Converti email in minuscolo
        match: [/^\S+@\S+\.\S+$/, 'Email non valida'] // Validazione formato email
    },
    password: {
        type: String,
        required: [true, 'Password obbligatoria'],
        minlength: [6, 'Password troppo corta (minimo 6 caratteri)'] // Lunghezza minima
    },
    name: {
        type: String,
        required: [true, 'Nome obbligatorio'],
        trim: true, // Rimuove spazi vuoti all'inizio e alla fine
        maxlength: [50, 'Nome troppo lungo (massimo 50 caratteri)']
    }
}, { 
    timestamps: true // Aggiunge automaticamente createdAt e updatedAt
});

// Esporta il modello per utilizzarlo nelle route
module.exports = mongoose.model('User', userSchema);