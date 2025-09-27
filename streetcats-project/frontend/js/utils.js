// js/utils.js - Funzioni utility condivise

/**
 * Gestione Alert
 */
class AlertManager {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('alert-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'alert-container';
            container.className = 'alert-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'success', duration = 5000) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-animated`;
        alert.textContent = message;

        this.container.appendChild(alert);

        // Auto remove
        setTimeout(() => {
            this.remove(alert);
        }, duration);

        // Manual remove on click
        alert.addEventListener('click', () => {
            this.remove(alert);
        });

        return alert;
    }

    remove(alert) {
        if (alert && alert.parentNode) {
            alert.classList.add('removing');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, 300);
        }
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    warning(message) {
        return this.show(message, 'warning');
    }
}

/**
 * Gestione Loading
 */
class LoadingManager {
    static show(containerId, message = 'Caricamento in corso...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    static hide(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loading = container.querySelector('.loading');
            if (loading) {
                loading.remove();
            }
        }
    }
}

/**
 * Gestione Autenticazione
 */
class AuthManager {
    static getToken() {
        return localStorage.getItem(window.APP_CONFIG.STORAGE.TOKEN);
    }

    static getUser() {
        const userStr = localStorage.getItem(window.APP_CONFIG.STORAGE.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    static setAuth(token, user) {
        localStorage.setItem(window.APP_CONFIG.STORAGE.TOKEN, token);
        localStorage.setItem(window.APP_CONFIG.STORAGE.USER, JSON.stringify(user));
    }

    static clearAuth() {
        localStorage.removeItem(window.APP_CONFIG.STORAGE.TOKEN);
        localStorage.removeItem(window.APP_CONFIG.STORAGE.USER);
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static requireAuth(redirectTo = 'login.html') {
        if (!this.isLoggedIn()) {
            window.alertManager.warning(window.APP_CONFIG.MESSAGES.ERROR.UNAUTHORIZED);
            setTimeout(() => {
                window.location.href = redirectTo;
            }, 1500);
            return false;
        }
        return true;
    }
}

/**
 * HTTP Client per API calls
 */
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = window.APP_CONFIG.API.BASE_URL + endpoint;
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // Aggiungi token se presente
        const token = AuthManager.getToken();
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // Merge headers
        const headers = { ...defaultHeaders, ...options.headers };
        
        // Se è FormData, rimuovi Content-Type per permettere al browser di settarlo
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Parse response
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Gestione errori di rete
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(window.APP_CONFIG.MESSAGES.ERROR.NETWORK);
            }
            
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        const options = {
            method: 'POST'
        };

        if (data instanceof FormData) {
            options.body = data;
        } else {
            options.body = JSON.stringify(data);
        }

        return this.request(endpoint, options);
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

/**
 * Utility per formatting
 */
class FormatUtils {
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static getImageUrl(filename) {
        if (!filename) {
        return 'https://via.placeholder.com/300x200?text=Nessuna+Immagine';
    }
    return window.APP_CONFIG.API.BASE_URL + window.APP_CONFIG.API.ENDPOINTS.UPLOADS + '/' + filename;
    }
}

/**
 * Utility per validazione form
 */
class ValidationUtils {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateForm(formElement, rules) {
        const errors = [];
        
        for (const [fieldName, rule] of Object.entries(rules)) {
            const field = formElement.querySelector(`[name="${fieldName}"], #${fieldName}`);
            const value = field ? field.value : '';
            
            if (rule.required && !this.validateRequired(value)) {
                errors.push(`${rule.label} è obbligatorio`);
                continue;
            }
            
            if (rule.email && value && !this.validateEmail(value)) {
                errors.push(`${rule.label} non è valida`);
            }
            
            if (rule.minLength && value && value.length < rule.minLength) {
                errors.push(`${rule.label} deve essere di almeno ${rule.minLength} caratteri`);
            }
        }
        
        return errors;
    }
}

/**
 * URL Utility per parametri query
 */
class UrlUtils {
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }

    static removeQueryParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.replaceState({}, '', url);
    }
}

// Inizializza manager globali
window.alertManager = new AlertManager();

// Esporta le utility
window.Utils = {
    AlertManager,
    LoadingManager,
    AuthManager,
    ApiClient,
    FormatUtils,
    ValidationUtils,
    UrlUtils
};