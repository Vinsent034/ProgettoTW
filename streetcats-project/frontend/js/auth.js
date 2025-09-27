// js/auth.js - Gestione Autenticazione per StreetCats

/**
 * QUESTO FILE GESTISCE:
 * - Login degli utenti
 * - Registrazione nuovi utenti  
 * - Controllo stato autenticazione
 * - Gestione token JWT
 * - Redirect e protezione pagine
 */

// ====================================
// VARIABILI GLOBALI
// ====================================

let authState = {
    isLoggedIn: false,
    currentUser: null,
    token: null
};

// ====================================
// FUNZIONI DI UTILITÀ AUTENTICAZIONE
// ====================================

/**
 * Controlla se l'utente è attualmente loggato
 * @returns {boolean} true se loggato, false se non loggato
 */
function isUserLoggedIn() {
    // Prende il token dal localStorage del browser
    const token = localStorage.getItem(window.APP_CONFIG.STORAGE.TOKEN);
    const user = localStorage.getItem(window.APP_CONFIG.STORAGE.USER);
    
    // Se esistono entrambi, l'utente è loggato
    return !!(token && user);
}

/**
 * Ottiene le informazioni dell'utente corrente
 * @returns {Object|null} Oggetto utente o null se non loggato
 */
function getCurrentUser() {
    try {
        // Prende i dati utente salvati nel browser
        const userString = localStorage.getItem(window.APP_CONFIG.STORAGE.USER);
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        console.error('Errore nel recupero utente:', error);
        return null;
    }
}

/**
 * Ottiene il token JWT corrente
 * @returns {string|null} Token JWT o null se non presente
 */
function getCurrentToken() {
    // Restituisce il token salvato nel localStorage
    return localStorage.getItem(window.APP_CONFIG.STORAGE.TOKEN);
}

/**
 * Salva i dati di autenticazione nel browser
 * @param {string} token - Token JWT ricevuto dal backend
 * @param {Object} user - Dati utente (id, name, email)
 */
function saveAuthData(token, user) {
    // Salva nel localStorage del browser (persiste anche dopo chiusura)
    localStorage.setItem(window.APP_CONFIG.STORAGE.TOKEN, token);
    localStorage.setItem(window.APP_CONFIG.STORAGE.USER, JSON.stringify(user));
    
    // Aggiorna stato globale
    authState.isLoggedIn = true;
    authState.currentUser = user;
    authState.token = token;
    
    console.log('Dati autenticazione salvati per:', user.name);
}

/**
 * Rimuove tutti i dati di autenticazione (logout)
 */
function clearAuthData() {
    // Rimuove tutto dal localStorage
    localStorage.removeItem(window.APP_CONFIG.STORAGE.TOKEN);
    localStorage.removeItem(window.APP_CONFIG.STORAGE.USER);
    
    // Reset stato globale
    authState.isLoggedIn = false;
    authState.currentUser = null;
    authState.token = null;
    
    console.log('Dati autenticazione rimossi');
}

// ====================================
// FUNZIONI PRINCIPALI LOGIN/REGISTER
// ====================================

/**
 * Esegue il login dell'utente
 * @param {string} email - Email dell'utente
 * @param {string} password - Password dell'utente
 * @returns {Promise<Object>} Risultato del login con token e user
 */
async function loginUser(email, password) {
    try {
        console.log('Tentativo login per:', email);
        
        // Chiama l'API del TUO backend
        const response = await fetch(window.APP_CONFIG.API.BASE_URL + window.APP_CONFIG.API.ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.trim(),
                password: password
            })
        });
        
        // Converte la risposta in JSON
        const data = await response.json();
        
        // Se il backend restituisce errore (status 400, 401, etc.)
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante il login');
        }
        
        // Se tutto ok, salva i dati e restituisce il risultato
        saveAuthData(data.token, data.user);
        console.log('Login completato con successo');
        return data;
        
    } catch (error) {
        console.error('Errore login:', error);
        throw error; // Rilancia l'errore per gestirlo nell'HTML
    }
}

/**
 * Registra un nuovo utente
 * @param {string} name - Nome completo dell'utente
 * @param {string} email - Email dell'utente
 * @param {string} password - Password dell'utente
 * @returns {Promise<Object>} Risultato della registrazione
 */
async function registerUser(name, email, password) {
    try {
        console.log('Tentativo registrazione per:', email);
        
        // Chiama l'API di registrazione del TUO backend
        const response = await fetch(window.APP_CONFIG.API.BASE_URL + window.APP_CONFIG.API.ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                password: password
            })
        });
        
        // Converte la risposta in JSON
        const data = await response.json();
        
        // Se il backend restituisce errore
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante la registrazione');
        }
        
        console.log('Registrazione completata con successo');
        return data;
        
    } catch (error) {
        console.error('Errore registrazione:', error);
        throw error; // Rilancia l'errore per gestirlo nell'HTML
    }
}

/**
 * Esegue il logout dell'utente
 */
function logoutUser() {
    console.log('Logout utente...');
    
    // Rimuove tutti i dati di autenticazione
    clearAuthData();
    
    // Mostra messaggio di conferma
    if (window.alertManager) {
        window.alertManager.success('Logout effettuato con successo!');
    }
    
    // Opzionale: redirect alla homepage dopo logout
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ====================================
// FUNZIONI DI PROTEZIONE PAGINE
// ====================================

/**
 * Protegge una pagina richiedendo il login
 * Se l'utente non è loggato, lo redirect al login
 * @param {string} redirectPage - Pagina dove andare se non loggato (default: login.html)
 */
function requireAuth(redirectPage = 'login.html') {
    // Controlla se l'utente è loggato
    if (!isUserLoggedIn()) {
        console.log('Accesso negato: utente non loggato');
        
        // Mostra messaggio di errore
        if (window.alertManager) {
            window.alertManager.warning('Devi essere loggato per accedere a questa pagina');
        }
        
        // Redirect al login dopo 1.5 secondi
        setTimeout(() => {
            // Aggiunge parametro ?redirect per tornare qui dopo login
            const currentPage = window.location.pathname.split('/').pop();
            window.location.href = `${redirectPage}?redirect=${currentPage}`;
        }, 1500);
        
        return false; // Blocca l'esecuzione
    }
    
    return true; // Accesso consentito
}

/**
 * Redirect automatico se l'utente è già loggato
 * Utile per pagine login/register
 * @param {string} redirectPage - Dove andare se già loggato (default: index.html)
 */
function redirectIfLoggedIn(redirectPage = 'index.html') {
    if (isUserLoggedIn()) {
        console.log('Utente già loggato, redirect...');
        
        if (window.alertManager) {
            window.alertManager.success('Sei già loggato!');
        }
        
        setTimeout(() => {
            window.location.href = redirectPage;
        }, 1000);
        
        return true; // È stato fatto redirect
    }
    
    return false; // Nessun redirect
}

// ====================================
// FUNZIONI DI VALIDAZIONE
// ====================================

/**
 * Valida i dati del form di login
 * @param {string} email - Email inserita
 * @param {string} password - Password inserita
 * @returns {Array} Array di errori (vuoto se tutto ok)
 */
function validateLoginData(email, password) {
    const errors = [];
    
    // Controlla email
    if (!email || email.trim() === '') {
        errors.push('Email è obbligatoria');
    } else if (!isValidEmail(email)) {
        errors.push('Email non è valida');
    }
    
    // Controlla password
    if (!password || password === '') {
        errors.push('Password è obbligatoria');
    }
    
    return errors;
}

/**
 * Valida i dati del form di registrazione
 * @param {string} name - Nome inserito
 * @param {string} email - Email inserita
 * @param {string} password - Password inserita
 * @param {string} confirmPassword - Conferma password
 * @returns {Array} Array di errori (vuoto se tutto ok)
 */
function validateRegisterData(name, email, password, confirmPassword) {
    const errors = [];
    
    // Controlla nome
    if (!name || name.trim() === '') {
        errors.push('Nome è obbligatorio');
    } else if (name.trim().length < 2) {
        errors.push('Nome deve essere di almeno 2 caratteri');
    } else if (name.trim().length > 50) {
        errors.push('Nome non può superare 50 caratteri');
    }
    
    // Controlla email
    if (!email || email.trim() === '') {
        errors.push('Email è obbligatoria');
    } else if (!isValidEmail(email)) {
        errors.push('Email non è valida');
    }
    
    // Controlla password
    if (!password || password === '') {
        errors.push('Password è obbligatoria');
    } else if (password.length < 6) {
        errors.push('Password deve essere di almeno 6 caratteri');
    }
    
    // Controlla conferma password
    if (!confirmPassword || confirmPassword === '') {
        errors.push('Conferma password è obbligatoria');
    } else if (password !== confirmPassword) {
        errors.push('Le password non coincidono');
    }
    
    return errors;
}

/**
 * Verifica se un'email ha un formato valido
 * @param {string} email - Email da controllare
 * @returns {boolean} true se valida, false se non valida
 */
function isValidEmail(email) {
    // Regex semplice per validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// ====================================
// FUNZIONI DI INIZIALIZZAZIONE
// ====================================

/**
 * Inizializza il modulo auth quando la pagina si carica
 * Controlla lo stato di autenticazione e aggiorna l'interfaccia
 */
function initializeAuth() {
    console.log('Inizializzazione modulo autenticazione...');
    
    // Controlla se l'utente è già loggato
    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        authState.isLoggedIn = true;
        authState.currentUser = user;
        authState.token = getCurrentToken();
        
        console.log('Utente loggato trovato:', user?.name);
    } else {
        console.log('Nessun utente loggato');
    }
    
    // Aggiorna la navigazione se presente
    updateNavigationAuth();
}

/**
 * Aggiorna la navigazione in base allo stato di autenticazione
 * Mostra/nasconde pulsanti login/logout
 */
function updateNavigationAuth() {
    // Cerca il container della navigazione
    const navButtons = document.getElementById('navButtons');
    if (!navButtons) return; // Se non esiste, esce
    
    if (authState.isLoggedIn && authState.currentUser) {
        // Utente loggato: mostra nome e pulsante logout
        navButtons.innerHTML = `
            <span class="user-info">
                👋 Ciao, ${authState.currentUser.name}
            </span>
            <a href="add-cat.html" class="btn btn-success">Aggiungi Gatto</a>
            <button class="btn btn-danger" onclick="handleLogoutClick()">Logout</button>
        `;
    } else {
        // Utente non loggato: mostra pulsanti login/register
        navButtons.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Accedi</a>
            <a href="register.html" class="btn btn-primary">Registrati</a>
        `;
    }
}

/**
 * Gestisce il click sul pulsante logout
 * Chiede conferma prima di procedere
 */
function handleLogoutClick() {
    // Chiede conferma all'utente
    if (confirm('Sei sicuro di voler uscire?')) {
        logoutUser();
    }
}

// ====================================
// ESPORTAZIONE FUNZIONI GLOBALI
// ====================================

/**
 * Rende le funzioni disponibili globalmente
 * Così possono essere usate negli HTML
 */
window.AuthManager = {
    // Funzioni principali
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    
    // Controlli stato
    isLoggedIn: isUserLoggedIn,
    getCurrentUser: getCurrentUser,
    getCurrentToken: getCurrentToken,
    
    // Protezione pagine
    requireAuth: requireAuth,
    redirectIfLoggedIn: redirectIfLoggedIn,
    
    // Validazione
    validateLogin: validateLoginData,
    validateRegister: validateRegisterData,
    
    // Inizializzazione
    initialize: initializeAuth,
    updateNavigation: updateNavigationAuth
};

// Rende disponibile anche handleLogoutClick per onclick nell'HTML
window.handleLogoutClick = handleLogoutClick;

// ====================================
// AUTO-INIZIALIZZAZIONE
// ====================================

/**
 * Inizializza automaticamente quando il DOM è pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    console.log('Modulo auth.js caricato e inizializzato');
});