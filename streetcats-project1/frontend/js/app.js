// Gestione principale dell'applicazione
class App {
    constructor() {
        this.authManager = window.authManager;
        this.map = window.streetCatsMap;
        
        this.initEventListeners();
        this.hideLoadingOverlay();
    }

    initEventListeners() {
        // Bottone "Aggiungi Gatto"
        const addCatBtn = document.getElementById('addCatBtn');
        if (addCatBtn) {
            addCatBtn.addEventListener('click', () => this.handleAddCat());
        }

        // Bottone mobile "Aggiungi Gatto"
        const mobileFab = document.getElementById('mobileFab');
        if (mobileFab) {
            mobileFab.addEventListener('click', () => this.handleAddCat());
        }

        // Simula login dopo 3 secondi (demo)
        setTimeout(() => {
            this.simulateDemoLogin();
        }, 3000);
    }

    handleAddCat() {
        if (!this.authManager.isLoggedIn()) {
            this.showNotification('Devi effettuare il login per aggiungere un gatto!', 'error');
            return;
        }

        this.showNotification('Funzione di aggiunta gatto in sviluppo!', 'info');
        
        // Simula aggiunta di un gatto
        setTimeout(() => {
            const newCat = this.map.addCat(
                40.8550 + (Math.random() - 0.5) * 0.01, // Lat random near center
                14.2700 + (Math.random() - 0.5) * 0.01, // Lng random near center
                'Nuovo Micio',
                'Gatto appena avvistato nella zona!'
            );
            
            this.showNotification(`Gatto "${newCat.name}" aggiunto alla mappa!`, 'success');
        }, 1000);
    }

    simulateDemoLogin() {
        // Solo per demo - simula un login automatico dopo 3 secondi
        if (!this.authManager.isLoggedIn() && Math.random() > 0.3) {
            this.authManager.token = 'demo-token';
            this.authManager.user = { name: 'DemoUser', email: 'demo@streetcats.com', avatar: 'D' };
            this.authManager.updateUI();
            this.showNotification('Benvenuto in StreetCats! (Demo Mode)', 'success');
        }
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
            
            this.showNotification('Mappa caricata con successo!', 'success');
            
            // Mostra indicatore di stato
            setTimeout(() => {
                const statusIndicator = document.getElementById('statusIndicator');
                if (statusIndicator) {
                    statusIndicator.classList.add('show');
                }
            }, 500);
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (notification && notificationText) {
            notificationText.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
}

// Inizializza l'app quando tutto è caricato
document.addEventListener('DOMContentLoaded', () => {
    // Attendi che i manager siano inizializzati
    setTimeout(() => {
        window.app = new App();
    }, 100);
});