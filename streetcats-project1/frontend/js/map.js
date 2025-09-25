// Mappa Leaflet - Visualizzazione gatti
class StreetCatsMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.initMap();
        this.loadSampleCats(); // Carica dati di esempio
    }

    initMap() {
        this.map = L.map('map').setView([40.8518, 14.2681], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        console.log('🗺️ Mappa inizializzata!');
    }

    loadSampleCats() {
        // Dati di esempio (sostituisci con chiamata API reale)
        const sampleCats = [
            { 
                id: 1, 
                name: "Micio del Centro", 
                description: "Gatto arancione molto socievole", 
                location: { lat: 40.8518, lng: 14.2681 },
                image: "cat1.jpg"
            },
            { 
                id: 2, 
                name: "Gattina del Porto", 
                description: "Gattina grigia con occhi verdi", 
                location: { lat: 40.8388, lng: 14.2488 },
                image: "cat2.jpg"
            },
            { 
                id: 3, 
                name: "Felix", 
                description: "Gatto nero con macchia bianca", 
                location: { lat: 40.8608, lng: 14.2794 },
                image: "cat3.jpg"
            }
        ];
        
        this.showCatsOnMap(sampleCats);
        this.updateStats(sampleCats.length);
    }

    showCatsOnMap(cats) {
        // Rimuovi marker precedenti
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Aggiungi nuovo marker per ogni gatto
        cats.forEach(cat => {
            const marker = L.marker([cat.location.lat, cat.location.lng])
                .addTo(this.map)
                .bindPopup(`
                    <div style="text-align: center; padding: 10px; min-width: 200px;">
                        <h3 style="margin: 0 0 10px 0; color: #667eea;">${cat.name}</h3>
                        <p style="margin: 0 0 10px 0;">${cat.description}</p>
                        <div style="background: #f0f0f0; padding: 10px; border-radius: 8px; margin: 10px 0;">
                            <span style="font-size: 2rem;">🐱</span>
                        </div>
                        <small style="color: #888;">Ultimo avvistamento: ${new Date().toLocaleDateString('it-IT')}</small>
                    </div>
                `);
            
            this.markers.push(marker);
        });

        console.log(`📍 ${cats.length} gatti mostrati sulla mappa!`);
    }

    updateStats(totalCats) {
        const totalCatsElement = document.getElementById('totalCats');
        const todaySightingsElement = document.getElementById('todaySightings');
        const activeUsersElement = document.getElementById('activeUsers');
        
        if (totalCatsElement) totalCatsElement.textContent = totalCats;
        if (todaySightingsElement) todaySightingsElement.textContent = Math.floor(Math.random() * 10) + 1;
        if (activeUsersElement) activeUsersElement.textContent = Math.floor(Math.random() * 50) + 10;
    }

    addCat(lat, lng, name, description) {
        // Aggiunge un nuovo gatto alla mappa
        const newCat = {
            id: Date.now(),
            name: name,
            description: description,
            location: { lat: lat, lng: lng },
            image: "new-cat.jpg"
        };
        
        const marker = L.marker([lat, lng])
            .addTo(this.map)
            .bindPopup(`
                <div style="text-align: center; padding: 10px;">
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">${name}</h3>
                    <p style="margin: 0 0 10px 0;">${description}</p>
                    <small style="color: #888;">Nuovo avvistamento!</small>
                </div>
            `);
        
        this.markers.push(marker);
        this.updateStats(this.markers.length);
        
        return newCat;
    }
}

// Inizializza la mappa
document.addEventListener('DOMContentLoaded', () => {
    window.streetCatsMap = new StreetCatsMap();
});