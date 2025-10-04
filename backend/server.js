require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const catRoute = require('./routes/cats');
const authRoute = require('./routes/auth');
const commentRoute = require('./routes/comments'); 

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connessione a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connesso a MongoDB'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

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
  console.log(`API endpoints:`);
  console.log(`  - POST /auth/register`);
  console.log(`  - POST /auth/login`);
  console.log(`  - GET  /cats`);
  console.log(`  - POST /cats`);
  console.log(`  - GET  /comments/:catId`);
  console.log(`  - POST /comments/:catId`);
});