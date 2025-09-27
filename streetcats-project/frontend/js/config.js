// js/config.js - Configurazione globale

// Configurazione API
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        CATS: '/cats',
        UPLOADS: '/uploads'
    }
};

// Configurazione mappa
const MAP_CONFIG = {
    DEFAULT_CENTER: [40.8518, 14.2681], // Napoli
    DEFAULT_ZOOM: 12,
    DETAIL_ZOOM: 15,
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '© OpenStreetMap contributors'
};

// Chiavi localStorage
const STORAGE_KEYS = {
    TOKEN: 'streetcats_token',
    USER: 'streetcats_user'
};

// Messaggi dell'app
const MESSAGES = {
    SUCCESS: {
        LOGIN: 'Login effettuato con successo!',
        REGISTER: 'Registrazione completata! Ora puoi accedere.',
        CAT_ADDED: 'Gatto aggiunto con successo!',
        LOGOUT: 'Logout effettuato con successo!'
    },
    ERROR: {
        LOGIN_FAILED: 'Email o password errati',
        REGISTER_FAILED: 'Errore durante la registrazione',
        NETWORK: 'Errore di connessione. Controlla la tua connessione internet.',
        UNAUTHORIZED: 'Devi essere loggato per accedere a questa sezione',
        CAT_NOT_FOUND: 'Gatto non trovato',
        SELECT_POSITION: 'Seleziona una posizione sulla mappa',
        GENERIC: 'Si è verificato un errore imprevisto'
    },
    LOADING: {
        CATS: 'Caricamento gatti in corso...',
        SAVING: 'Salvataggio in corso...',
        LOGIN: 'Accesso in corso...'
    }
};

// Esporta la configurazione per uso globale
window.APP_CONFIG = {
    API: API_CONFIG,
    MAP: MAP_CONFIG,
    STORAGE: STORAGE_KEYS,
    MESSAGES: MESSAGES
};