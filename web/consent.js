// web/consent.js
const express = require('express');
const bodyParser = require('body-parser');
const { updateConsent } = require('../utils/consentManager');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Stay Connected</h1>
        <p>Enter your phone number to receive updates about our services:</