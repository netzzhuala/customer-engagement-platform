// models/contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  consent: {
    type: Boolean,
    required: true,
    default: false
  },
  consentSource: {
    type: String,
    enum: ['web_form', 'phone_opt_in', 'existing_customer', 'referral'],
    required: function() { return this.consent; }
  },
  consentTimestamp: {
    type: Date,
    required: function() { return this.consent; }
  },
  contactHistory: [{
    timestamp: Date,
    agent: String,
    outcome: String,
    duration: Number
  }],
  lastContact: Date,
  contactFrequency: {
    type: Number,
    default: 0
  },
  dnc: {
    type: Boolean,
    default: false
  },
  assigned: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: String,
    default: null
  },
  rawData: String,
  notes: String
});

module.exports = mongoose.model('Contact', contactSchema);