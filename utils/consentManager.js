// utils/consentManager.js
const Contact = require('../models/contact');

async function verifyConsent(phoneNumber) {
  const contact = await Contact.findOne({ phoneNumber });
  return contact ? contact.consent : false;
}

async function updateConsent(phoneNumber, source, notes) {
  await Contact.findOneAndUpdate(
    { phoneNumber },
    {
      consent: true,
      consentSource: source,
      consentTimestamp: new Date(),
      notes: notes
    },
    { upsert: true }
  );
}

async function addToDNC(phoneNumber) {
  await Contact.findOneAndUpdate(
    { phoneNumber },
    { dnc: true }
  );
}

async function checkContactFrequency(phoneNumber) {
  const contact = await Contact.findOne({ phoneNumber });
  if (!contact) return 0;
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const recentContacts = contact.contactHistory.filter(
    entry => entry.timestamp > oneMonthAgo
  );
  
  return recentContacts.length;
}

module.exports = {
  verifyConsent,
  updateConsent,
  addToDNC,
  checkContactFrequency
};