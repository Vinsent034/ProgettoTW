// test-db.js - Test rapido database
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 Test database MongoDB...');

const MONGODB_URI = process.env.MONGODB_URI;
console.log('📍 URI presente:', !!MONGODB_URI);

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI mancante nel .env');
    process.exit(1);
}

// Test connessione
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('✅ Connessione riuscita!');
        console.log('🗄️  Database:', mongoose.connection.name);
        console.log('🌐 Host:', mongoose.connection.host);
        
        // Test creazione utente
        console.log('\n🧪 Test creazione utente...');
        
        const User = require('./models/User');
        
        try {
            // Cancella utente test se esiste
            await User.deleteMany({ email: 'test-db@test.com' });
            
            // Crea nuovo utente
            const testUser = new User({
                name: 'Test Database',
                email: 'test-db@test.com',
                password: 'hashedpassword123'
            });
            
            const savedUser = await testUser.save();
            console.log('✅ Utente creato:', savedUser._id);
            
            // Verifica che esista
            const foundUser = await User.findById(savedUser._id);
            console.log('✅ Utente trovato:', foundUser.name);
            
            // Pulisci
            await User.deleteOne({ _id: savedUser._id });
            console.log('✅ Utente rimosso');
            
            console.log('\n🎉 Database funziona correttamente!');
            
        } catch (error) {
            console.error('❌ Errore operazioni database:', error);
        }
        
        process.exit(0);
        
    })
    .catch(err => {
        console.error('❌ Errore connessione database:', err.message);
        
        if (err.message.includes('Authentication failed')) {
            console.log('\n💡 PROBLEMA AUTENTICAZIONE:');
            console.log('- Controlla username/password nel connection string');
            console.log('- Verifica che l\'utente esista in MongoDB Atlas');
        }
        
        if (err.message.includes('ENOTFOUND')) {
            console.log('\n💡 PROBLEMA CONNESSIONE:');
            console.log('- Controlla connection string nel .env');
            console.log('- Verifica che il cluster sia attivo su Atlas');
        }
        
        process.exit(1);
    });