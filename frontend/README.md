# StreetCats Frontend

Frontend semplice per l'applicazione StreetCats - Segnalazione gatti di strada.

## Struttura File

```
frontend/
├── index.html          # Homepage con mappa dei gatti
├── login.html          # Pagina login/registrazione
├── add-cat.html        # Form per aggiungere nuovo gatto
├── cat-detail.html     # Dettaglio singolo gatto
└── README.md           # Questo file
```

## Tecnologie Utilizzate

- **HTML5/CSS3/JavaScript Vanilla** - Base dell'applicazione
- **Bootstrap 5.3.0** - Framework CSS per responsive design
- **Leaflet.js 1.9.4** - Libreria per mappe interattive

## Istruzioni per l'Esecuzione

### Prerequisiti
1. Backend StreetCats in esecuzione su `http://localhost:3000`
2. Browser moderno

### Avvio Frontend

#### Opzione 1: Server Web Locale (Consigliato)
```bash
# Con Python
python3 -m http.server 8080

# Con Node.js
npx http-server -p 8080

# Con PHP
php -S localhost:8080
```

Poi vai su: `http://localhost:8080`

#### Opzione 2: Apertura Diretta
Apri `index.html` direttamente nel browser

### Test Completo

1. **Avvia backend**: `npm run dev` nella cartella backend
2. **Servi frontend**: Usa uno dei comandi sopra
3. **Testa il flusso**:
   - Vai su `http://localhost:8080`
   - Registrati/accedi
   - Aggiungi un gatto
   - Visualizza sulla mappa
   - Vai ai dettagli

## Funzionalità Implementate

### ✅ Homepage (index.html)
- Mappa con marker dei gatti
- Popup con anteprima e link dettaglio
- Autenticazione navbar
- Pulsante "Aggiungi Gatto"

### ✅ Login (login.html)
- Form dual login/registrazione
- Validazione client-side
- Token JWT in localStorage

### ✅ Aggiungi Gatto (add-cat.html)
- Upload immagine + anteprima
- Selezione posizione su mappa
- Form validato
- Invio FormData al backend

### ✅ Dettaglio (cat-detail.html)
- Foto e informazioni complete
- Mappa posizione
- Descrizione formattata
- Sistema commenti simulato

## API Utilizzate

```
GET /cats           # Lista gatti
POST /cats          # Nuovo gatto (auth + multipart)
GET /cats/:id       # Dettaglio gatto
POST /auth/register # Registrazione
POST /auth/login    # Login
```

## Note di Sicurezza

- Token JWT salvato in localStorage
- Header Authorization automatico
- Validazione form client + server
- Protezione rotte autenticate

## Troubleshooting

**CORS Error**: Usa server web locale  
**Immagini non caricano**: Verifica `/uploads` backend  
**Token expired**: Logout e login  
**Mappa non carica**: Controlla connessione internet