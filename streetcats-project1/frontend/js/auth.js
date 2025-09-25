class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        this.initForms();
        this.updateUI();
    }

    initForms() {
        // Form Login - solo se esiste nella pagina
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        // Form Registrazione - solo se esiste nella pagina
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e);
            });
        }

        // Logout button - solo se esiste nella pagina
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    handleLogin(e) {
    const button = e.target.querySelector('.submit-btn');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        this.showMessage('Compila tutti i campi', 'error');
        return;
    }

    // Validazione formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        this.showMessage('Inserisci un indirizzo email valido', 'error');
        return;
    }

    this.showLoading(button, true);
    
    // 🔥 MODIFICA QUI: Chiamata al backend reale
    fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        this.showLoading(button, false);
        
        if (data.success) {
            // Login riuscito
            this.token = data.token;
            this.user = data.user;
            
            localStorage.setItem('authToken', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            
            this.showMessage('Login effettuato con successo!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            // Login fallito
            this.showMessage(data.error || 'Email o password non valide!', 'error');
        }
    })
    .catch(error => {
        this.showLoading(button, false);
        this.showMessage('Errore di connessione con il server', 'error');
        console.error('Errore login:', error);
    });
}

    handleRegister(e) {
    const button = e.target.querySelector('.submit-btn');
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
        this.showMessage('Compila tutti i campi', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        this.showMessage('Inserisci un indirizzo email valido', 'error');
        return;
    }

    if (password.length < 6) {
        this.showMessage('La password deve essere di almeno 6 caratteri', 'error');
        return;
    }

    this.showLoading(button, true);
    
    // 🔥 MODIFICA QUI: Chiamata al backend reale
    fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        this.showLoading(button, false);
        
        if (data.success) {
            this.showMessage('Registrazione completata! Ora puoi effettuare il login.', 'success');
            document.getElementById('registerForm').reset();
            
            setTimeout(() => {
                this.switchToLogin();
            }, 2000);
        } else {
            this.showMessage(data.error || 'Errore durante la registrazione', 'error');
        }
    })
    .catch(error => {
        this.showLoading(button, false);
        this.showMessage('Errore di connessione con il server', 'error');
        console.error('Errore registrazione:', error);
    });
}

    switchToLogin() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        }
    }

    showLoading(button, show) {
        const loading = button.querySelector('.loading');
        if (show) {
            loading.style.display = 'inline-block';
            button.disabled = true;
        } else {
            loading.style.display = 'none';
            button.disabled = false;
        }
    }

    showMessage(text, type) {
        // Usa il sistema di messaggi esistente nella pagina
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = `message ${type}`;
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 4000);
        } else {
            // Fallback: alert
            alert(text);
        }
    }

    updateUI() {
        // Aggiorna l'interfaccia in base allo stato di login
        const logoutBtn = document.getElementById('logoutBtn');
        const loginBtn = document.querySelector('.login-btn');
        const addCatBtn = document.getElementById('addCatBtn');
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');

        if (this.token && this.user) {
            // Utente LOGGATO
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (addCatBtn) addCatBtn.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'flex';
            if (userAvatar) userAvatar.textContent = this.user.avatar || 'U';
        } else {
            // Utente NON loggato
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (addCatBtn) addCatBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        
        this.showMessage('Logout effettuato', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    isLoggedIn() {
        return !!this.token;
    }

    getUser() {
        return this.user;
    }
}

// Inizializza l'autenticazione
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});