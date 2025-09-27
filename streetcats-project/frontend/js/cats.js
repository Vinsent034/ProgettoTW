// js/cats.js - Gestione Gatti e Mappe per StreetCats

/**
 * QUESTO FILE GESTISCE:
 * - Caricamento lista gatti dal backend
 * - Visualizzazione gatti sulla mappa Leaflet
 * - Aggiunta nuovi gatti (con foto e posizione)
 * - Gestione marker e popup sulla mappa
 * - Form di inserimento con validazione
 */

// ====================================
// VARIABILI GLOBALI MAPPE E GATTI
// ====================================

let mainMap = null;           // Mappa principale (index.html)
let addCatMap = null;         // Mappa per aggiungere gatto (add-cat.html)
let detailMap = null;         // Mappa dettaglio gatto (cat-detail.html)
let selectedMarker = null;    // Marker selezionato per nuovo gatto
let catsData = [];           // Array con tutti i gatti caricati
let markersLayer = null;      // Layer per gestire i marker

// ====================================
// FUNZIONI INIZIALIZZAZIONE MAPPE
// ====================================

/**
 * Inizializza la mappa principale della homepage
 * Mostra tutti i gatti esistenti con marker cliccabili
 */
function initializeMainMap() {
    // Controlla se l'elemento mappa esiste
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.log('Elemento mappa non trovato su questa pagina');
        return;
    }

    console.log('Inizializzazione mappa principale...');
    
    // Crea la mappa centrata su Napoli
    mainMap = L.map('map').setView(
        window.APP_CONFIG.MAP.DEFAULT_CENTER, 
        window.APP_CONFIG.MAP.DEFAULT_ZOOM
    );
    
    // Aggiunge il layer delle tiles (sfondo mappa)
    L.tileLayer(window.APP_CONFIG.MAP.TILE_LAYER, {
        attribution: window.APP_CONFIG.MAP.ATTRIBUTION,
        maxZoom: 19
    }).addTo(mainMap);
    
    // Crea layer per i marker dei gatti
    markersLayer = L.layerGroup().addTo(mainMap);
    
    console.log('Mappa principale inizializzata');
}

/**
 * Inizializza la mappa per aggiungere un nuovo gatto
 * Permette di cliccare per selezionare la posizione
 */
function initializeAddCatMap() {
    const mapElement = document.getElementById('addMap');
    if (!mapElement) {
        console.log('Elemento addMap non trovato');
        return;
    }

    console.log('Inizializzazione mappa aggiunta gatto...');
    
    // Rimuove mappa esistente se presente
    if (addCatMap) {
        addCatMap.remove();
    }
    
    // Piccolo delay per assicurarsi che l'elemento sia visibile
    setTimeout(() => {
        // Crea nuova mappa
        addCatMap = L.map('addMap').setView(
            window.APP_CONFIG.MAP.DEFAULT_CENTER, 
            13
        );
        
        // Aggiunge tiles
        L.tileLayer(window.APP_CONFIG.MAP.TILE_LAYER, {
            attribution: window.APP_CONFIG.MAP.ATTRIBUTION,
            maxZoom: 19
        }).addTo(addCatMap);
        
        // Gestisce click sulla mappa per selezionare posizione
        addCatMap.on('click', function(e) {
            handleMapClick(e);
        });
        
        console.log('Mappa aggiunta gatto inizializzata');
    }, 100);
}

/**
 * Inizializza la mappa di dettaglio per un singolo gatto
 * @param {number} lat - Latitudine del gatto
 * @param {number} lng - Longitudine del gatto
 * @param {string} catName - Nome del gatto per il popup
 */
function initializeDetailMap(lat, lng, catName) {
    const mapElement = document.getElementById('catDetailMap');
    if (!mapElement) {
        console.log('Elemento catDetailMap non trovato');
        return;
    }

    console.log('Inizializzazione mappa dettaglio gatto...');
    
    // Rimuove mappa esistente
    if (detailMap) {
        detailMap.remove();
    }
    
    setTimeout(() => {
        // Crea mappa centrata sulla posizione del gatto
        detailMap = L.map('catDetailMap').setView([lat, lng], window.APP_CONFIG.MAP.DETAIL_ZOOM);
        
        // Aggiunge tiles
        L.tileLayer(window.APP_CONFIG.MAP.TILE_LAYER, {
            attribution: window.APP_CONFIG.MAP.ATTRIBUTION,
            maxZoom: 19
        }).addTo(detailMap);
        
        // Aggiunge marker del gatto
        L.marker([lat, lng])
            .addTo(detailMap)
            .bindPopup(`📍 ${catName}`)
            .openPopup();
            
        console.log('Mappa dettaglio inizializzata');
    }, 100);
}

// ====================================
// GESTIONE CLICK MAPPA E MARKER
// ====================================

/**
 * Gestisce il click sulla mappa per selezionare posizione nuovo gatto
 * @param {Object} e - Evento click di Leaflet
 */
function handleMapClick(e) {
    console.log('Click mappa:', e.latlng);
    
    // Rimuove marker precedente se esiste
    if (selectedMarker) {
        addCatMap.removeLayer(selectedMarker);
    }
    
    // Crea nuovo marker nella posizione cliccata
    selectedMarker = L.marker(e.latlng)
        .addTo(addCatMap)
        .bindPopup('📍 Posizione selezionata per il gatto')
        .openPopup();
    
    // Salva coordinate nei campi hidden del form
    const latField = document.getElementById('catLat');
    const lngField = document.getElementById('catLng');
    
    if (latField && lngField) {
        latField.value = e.latlng.lat;
        lngField.value = e.latlng.lng;
        console.log('Coordinate salvate:', e.latlng.lat, e.latlng.lng);
    }
}

// ====================================
// CARICAMENTO E VISUALIZZAZIONE GATTI
// ====================================

/**
 * Carica tutti i gatti dal backend
 * @returns {Promise<Array>} Array di gatti
 */
async function loadCatsFromAPI() {
    try {
        console.log('Caricamento gatti dal backend...');
        
        // Chiama API del backend per ottenere tutti i gatti
        const response = await Utils.ApiClient.get(window.APP_CONFIG.API.ENDPOINTS.CATS);
        
        console.log(`Caricati ${response.length} gatti`);
        return response;
        
    } catch (error) {
        console.error('Errore caricamento gatti:', error);
        throw error;
    }
}

/**
 * Mostra i gatti sulla mappa principale con marker
 * @param {Array} cats - Array di gatti da mostrare
 */
function displayCatsOnMap(cats) {
    if (!mainMap || !markersLayer) {
        console.log('Mappa non inizializzata');
        return;
    }
    
    console.log('Visualizzazione gatti sulla mappa...');
    
    // Pulisce marker esistenti
    markersLayer.clearLayers();
    
    // Se non ci sono gatti, esce
    if (!cats || cats.length === 0) {
        console.log('Nessun gatto da mostrare');
        return;
    }
    
    // Aggiunge marker per ogni gatto
    cats.forEach(cat => {
        // Crea marker
        const marker = L.marker([cat.location.lat, cat.location.lng]);
        
        // Crea popup con info gatto
        const popupContent = createCatPopupContent(cat);
        marker.bindPopup(popupContent);
        
        // Aggiunge marker al layer
        markersLayer.addLayer(marker);
    });
    
    // Adatta vista mappa per mostrare tutti i marker
    try {
        if (cats.length > 0) {
            const group = new L.featureGroup(Object.values(markersLayer._layers));
            mainMap.fitBounds(group.getBounds(), { 
                padding: [20, 20],
                maxZoom: 15 
            });
        }
    } catch (e) {
        console.log('Impossibile adattare bounds mappa');
    }
    
    console.log(`${cats.length} marker aggiunti alla mappa`);
}

/**
 * Crea il contenuto HTML per il popup di un gatto
 * @param {Object} cat - Oggetto gatto
 * @returns {string} HTML del popup
 */
function createCatPopupContent(cat) {
    return `
        <div style="text-align: center; max-width: 200px;">
            <img src="${Utils.FormatUtils.getImageUrl(cat.image)}" 
                 style="width: 100%; height: 100px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;"
                 onerror="this.style.display='none'">
            <h4 style="margin: 5px 0; font-size: 1rem; color: #2c3e50;">${cat.name}</h4>
            <p style="margin: 5px 0; font-size: 0.8rem; color: #666; line-height: 1.3;">
                ${Utils.FormatUtils.truncateText(cat.description, 60)}
            </p>
            <p style="margin: 5px 0; font-size: 0.7rem; color: #999;">
                📅 ${Utils.FormatUtils.formatDate(cat.date)}
            </p>
            <a href="cat-detail.html?id=${cat._id}" 
               style="display: inline-block; background: #667eea; color: white; padding: 5px 10px; border-radius: 5px; text-decoration: none; font-size: 0.8rem; margin-top: 5px;">
                Vedi Dettagli →
            </a>
        </div>
    `;
}

/**
 * Mostra i gatti in una griglia (homepage)
 * @param {Array} cats - Array di gatti da mostrare
 */
function displayCatsGrid(cats) {
    const grid = document.getElementById('catsGrid');
    if (!grid) return;
    
    console.log('displayCatsGrid chiamata con:', cats); // ← DEBUG
    console.log('Tipo di cats:', typeof cats); // ← DEBUG
    console.log('È array?', Array.isArray(cats)); // ← DEBUG
    
    // Se non ci sono gatti
    if (!cats || cats.length === 0) {
        grid.innerHTML = createEmptyState();
        return;
    }
    
    // Debug ogni gatto
    cats.forEach((cat, index) => {
        console.log(`Gatto ${index}:`, cat); // ← DEBUG
        console.log(`Ha _id?`, cat && cat._id); // ← DEBUG
    });
    
    // Crea cards per ogni gatto (con protezione)
    const validCats = cats.filter(cat => cat && cat._id);
    console.log('Gatti validi:', validCats.length); // ← DEBUG
    
    grid.innerHTML = validCats.map(cat => createCatCard(cat)).join('');
    
    console.log(`${validCats.length} card gatti create`);
}

/**
 * Crea l'HTML per lo stato vuoto (nessun gatto)
 * @returns {string} HTML stato vuoto
 */
function createEmptyState() {
    const isLoggedIn = Utils.AuthManager.isLoggedIn();
    
    return `
        <div class="empty-state">
            <h3>🐱 Nessun gatto trovato</h3>
            <p>Sii il primo ad aggiungere un avvistamento nella tua zona!</p>
            ${isLoggedIn ? 
                '<a href="add-cat.html" class="btn btn-success">Aggiungi il primo gatto</a>' : 
                '<a href="register.html" class="btn btn-primary">Registrati per aggiungere</a>'
            }
        </div>
    `;
}

/**
 * Crea l'HTML per la card di un singolo gatto
 * @param {Object} cat - Oggetto gatto
 * @returns {string} HTML della card
 */
function createCatCard(cat) {
    return `
        <a href="cat-detail.html?id=${cat._id}" class="cat-card">
            <img src="${Utils.FormatUtils.getImageUrl(cat.image)}" 
                 alt="${cat.name}" 
                 class="cat-image" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Immagine+non+disponibile'">
            <div class="cat-content">
                <h3 class="cat-title">${cat.name}</h3>
                <div class="cat-description">
                    ${Utils.FormatUtils.truncateText(cat.description, 100)}
                </div>
                <div class="cat-date">
                    📅 ${Utils.FormatUtils.formatDate(cat.date)}
                </div>
            </div>
        </a>
    `;
}

// ====================================
// AGGIUNTA NUOVO GATTO
// ====================================

/**
 * Gestisce l'invio del form per aggiungere un nuovo gatto
 * @param {Event} event - Evento submit del form
 */
async function handleAddCatForm(event) {
    event.preventDefault();
    
    console.log('Invio form nuovo gatto...');
    
    const submitBtn = document.getElementById('addCatBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Disabilita pulsante
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvataggio in corso...';
        
        // Ottiene dati dal form
        const formData = getAddCatFormData();
        
        // Validazione
        const errors = validateAddCatForm(formData);
        if (errors.length > 0) {
            showAddCatErrors(errors);
            return;
        }
        
        // Prepara FormData per upload
        const uploadData = createAddCatFormData(formData);
        
        // Invia al backend
        const response = await Utils.ApiClient.post(
            window.APP_CONFIG.API.ENDPOINTS.CATS,
            uploadData
        );
        
        console.log('Gatto aggiunto con successo:', response);
        
        // Success feedback
        window.alertManager.success(window.APP_CONFIG.MESSAGES.SUCCESS.CAT_ADDED);
        
        // Reset form e redirect
        resetAddCatForm();
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Errore aggiunta gatto:', error);
        showAddCatErrors([error.message || 'Errore durante il salvataggio']);
        
    } finally {
        // Riabilita pulsante
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Ottiene i dati dal form di aggiunta gatto
 * @returns {Object} Dati del form
 */
function getAddCatFormData() {
    return {
        image: document.getElementById('catImage')?.files[0],
        name: document.getElementById('catName')?.value?.trim(),
        description: document.getElementById('catDescription')?.value?.trim(),
        lat: document.getElementById('catLat')?.value,
        lng: document.getElementById('catLng')?.value
    };
}

/**
 * Valida i dati del form di aggiunta gatto
 * @param {Object} data - Dati da validare
 * @returns {Array} Array di errori
 */
function validateAddCatForm(data) {
    const errors = [];
    
    // Controlla immagine
    if (!data.image) {
        errors.push('Seleziona una foto del gatto');
    } else if (!data.image.type.startsWith('image/')) {
        errors.push('Il file deve essere un\'immagine');
    } else if (data.image.size > 5 * 1024 * 1024) {
        errors.push('L\'immagine deve essere massimo 5MB');
    }
    
    // Controlla nome
    if (!data.name) {
        errors.push('Il nome è obbligatorio');
    } else if (data.name.length < 3) {
        errors.push('Il nome deve essere di almeno 3 caratteri');
    }
    
    // Controlla descrizione
    if (!data.description) {
        errors.push('La descrizione è obbligatoria');
    } else if (data.description.length < 10) {
        errors.push('La descrizione deve essere di almeno 10 caratteri');
    }
    
    // Controlla posizione
    if (!data.lat || !data.lng) {
        errors.push('Seleziona una posizione sulla mappa');
    }
    
    return errors;
}

/**
 * Crea FormData per l'upload
 * @param {Object} data - Dati del form
 * @returns {FormData} FormData pronto per l'invio
 */
function createAddCatFormData(data) {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('lat', data.lat);
    formData.append('lng', data.lng);
    return formData;
}

/**
 * Mostra errori del form aggiunta gatto
 * @param {Array} errors - Array di errori
 */
function showAddCatErrors(errors) {
    const container = document.getElementById('addCatAlerts');
    if (container) {
        container.innerHTML = errors.map(error => `
            <div class="alert alert-error">
                ${error}
            </div>
        `).join('');
        
        container.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Reset del form aggiunta gatto
 */
function resetAddCatForm() {
    const form = document.getElementById('addCatForm');
    if (form) {
        form.reset();
    }
    
    // Rimuove marker selezionato
    if (selectedMarker && addCatMap) {
        addCatMap.removeLayer(selectedMarker);
        selectedMarker = null;
    }
    
    // Pulisce alert
    const alertContainer = document.getElementById('addCatAlerts');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}

// ====================================
// CARICAMENTO DETTAGLIO GATTO
// ====================================

/**
 * Carica e mostra il dettaglio di un singolo gatto
 * @param {string} catId - ID del gatto
 */
async function loadCatDetail(catId) {
    try {
        console.log('Caricamento dettaglio gatto:', catId);
        
        // Mostra loading
        const container = document.getElementById('catDetailContent');
        if (container) {
            Utils.LoadingManager.show('catDetailContent', 'Caricamento dettaglio...');
        }
        
        // Carica gatto dal backend
        const cat = await Utils.ApiClient.get(`${window.APP_CONFIG.API.ENDPOINTS.CATS}/${catId}`);
        
        // Mostra dettaglio
        displayCatDetail(cat);
        
        // Inizializza mappa dettaglio
        initializeDetailMap(cat.location.lat, cat.location.lng, cat.name);
        
    } catch (error) {
        console.error('Errore caricamento dettaglio:', error);
        
        const container = document.getElementById('catDetailContent');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Gatto non trovato</h3>
                    <p>Il gatto che stai cercando non esiste o è stato rimosso.</p>
                    <a href="index.html" class="btn btn-primary">Torna alla mappa</a>
                </div>
            `;
        }
        
        window.alertManager.error('Gatto non trovato');
    }
}

/**
 * Mostra il dettaglio di un gatto
 * @param {Object} cat - Oggetto gatto
 */
function displayCatDetail(cat) {
    const container = document.getElementById('catDetailContent');
    if (!container) return;
    
    // Converte descrizione Markdown se disponibile
    let descriptionHtml = cat.description;
    if (window.marked) {
        try {
            descriptionHtml = window.marked.parse(cat.description);
        } catch (e) {
            console.log('Markdown non disponibile, uso testo normale');
        }
    }
    
    container.innerHTML = `
        <a href="index.html" class="btn btn-secondary back-btn">← Torna alla mappa</a>
        
        <img src="${Utils.FormatUtils.getImageUrl(cat.image)}" 
             alt="${cat.name}" 
             class="cat-detail-image" 
             onerror="this.style.display='none'">
        
        <h1>${cat.name}</h1>
        <div class="cat-meta">
            📅 ${Utils.FormatUtils.formatDate(cat.date)}
        </div>
        
        <div class="cat-description-full">
            ${descriptionHtml}
        </div>
        
        <div id="catDetailMap" class="map small"></div>
        
        <div class="comments-section">
            <h3 class="comments-title">💬 Commenti</h3>
            <div id="commentsList">
                <p style="color: #7f8c8d; text-align: center; padding: 20px;">
                    I commenti saranno implementati in una versione futura
                </p>
            </div>
            
            ${Utils.AuthManager.isLoggedIn() ? `
                <form id="commentForm" style="margin-top: 20px;">
                    <div class="form-group">
                        <textarea class="form-control" 
                                  placeholder="Scrivi un commento su questo gatto..." 
                                  required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Aggiungi Commento</button>
                </form>
            ` : `
                <div style="text-align: center; color: #7f8c8d; padding: 20px;">
                    <a href="login.html" style="color: #667eea;">Accedi</a> per aggiungere un commento
                </div>
            `}
        </div>
    `;
}

// ====================================
// FUNZIONI PRINCIPALI ESPORTATE
// ====================================

/**
 * Inizializza tutto il modulo cats per la pagina corrente
 */
async function initializeCatsModule() {
    console.log('Inizializzazione modulo cats...');
    
    try {
        // Determina che pagina è e inizializza di conseguenza
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (currentPage) {
            case 'index.html':
            case '':
                await initializeHomePage();
                break;
                
            case 'add-cat.html':
                initializeAddCatPage();
                break;
                
            case 'cat-detail.html':
                initializeCatDetailPage();
                break;
                
            default:
                console.log('Pagina non gestita da cats.js');
        }
        
    } catch (error) {
        console.error('Errore inizializzazione cats:', error);
    }
}

/**
 * Inizializza la homepage con mappa e griglia
 */
async function initializeHomePage() {
    console.log('Inizializzazione homepage...');
    
    // Inizializza mappa
    initializeMainMap();
    
    // Carica e mostra gatti
    try {
        catsData = await loadCatsFromAPI();
        displayCatsGrid(catsData);
        displayCatsOnMap(catsData);
    } catch (error) {
        console.error('Errore caricamento gatti homepage:', error);
        
        const grid = document.getElementById('catsGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Errore di caricamento</h3>
                    <p>Non è stato possibile caricare i gatti.</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Riprova</button>
                </div>
            `;
        }
    }
}

/**
 * Inizializza la pagina di aggiunta gatto
 */
function initializeAddCatPage() {
    console.log('Inizializzazione pagina aggiunta gatto...');
    
    // Controlla autenticazione
    if (!Utils.AuthManager.requireAuth()) {
        return;
    }
    
    // Inizializza mappa
    initializeAddCatMap();
    
    // Setup form
    const form = document.getElementById('addCatForm');
    if (form) {
        form.addEventListener('submit', handleAddCatForm);
    }
}

/**
 * Inizializza la pagina di dettaglio gatto
 */
function initializeCatDetailPage() {
    console.log('Inizializzazione pagina dettaglio gatto...');
    
    // Ottiene ID gatto dall'URL
    const catId = Utils.UrlUtils.getQueryParam('id');
    
    if (!catId) {
        window.alertManager.error('ID gatto mancante');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Carica dettaglio
    loadCatDetail(catId);
}

// ====================================
// ESPORTAZIONE GLOBALE
// ====================================

/**
 * Rende le funzioni disponibili globalmente
 */
window.CatsManager = {
    // Inizializzazione
    initialize: initializeCatsModule,
    initializeMainMap: initializeMainMap,
    initializeAddCatMap: initializeAddCatMap,
    initializeDetailMap: initializeDetailMap,
    
    // Caricamento dati
    loadCats: loadCatsFromAPI,
    loadCatDetail: loadCatDetail,
    
    // Visualizzazione
    displayCatsOnMap: displayCatsOnMap,
    displayCatsGrid: displayCatsGrid,
    displayCatDetail: displayCatDetail,
    
    // Form
    handleAddCatForm: handleAddCatForm,
    resetAddCatForm: resetAddCatForm
};

// ====================================
// AUTO-INIZIALIZZAZIONE
// ====================================

/**
 * Inizializza automaticamente quando il DOM è pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeCatsModule();
    console.log('Modulo cats.js caricato e inizializzato');
});