require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const catRoute = require('./routes/cats');
const authRoute = require('./routes/auth');
const commentRoute = require('./routes/comments'); 

const MONGODB_URI = process.env.MONGODB_URI;

const app = express(); // 👈 PRIMA crei app
const PORT = process.env.PORT || 3000;

// 👇 POI configuri i middleware
app.use(cors()); // 👈 ORA è nel posto giusto!
app.use(express.json());

// Connessione a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connesso a MongoDB Cloud!'))
  .catch(err => console.error('❌ Errore di connessione:', err));

// Servi file statici dalla cartella 'uploads'
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/cats', catRoute);
app.use('/auth', authRoute);
app.use('/comments', commentRoute);

// Route principale
app.get('/', (req, res) => {
  res.send('Hello StreetCats!');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Registrazione: http://localhost:${PORT}/auth/register`);
  console.log(`Login: http://localhost:${PORT}/auth/login`);
  console.log(`Lista gatti: http://localhost:${PORT}/cats`);
  console.log(`Commenti: http://localhost:${PORT}/comments/:catId`);
});