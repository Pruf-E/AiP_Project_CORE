const mongoose = require('mongoose');

const coreStyleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 70 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: String, required: true, trim: true, maxlength: 40 },
  tagline: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 1800 },
  palette: { type: [String], default: [] },
  symbols: { type: [String], default: [] },
  cover: { type: String, default: 'lavender' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('CoreStyle', coreStyleSchema);
