const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  image: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cat', catSchema);