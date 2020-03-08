const express = require('express');
const app = express();
const process = require('process');

const PORT = process.env.PORT || 7005;
const IP = process.env.HOST ||' localhost';

const dotenv = require('dotenv').config();

let lifeObjects;
try {
  lifeObjects = require(`${__dirname}/json/lifeObjects.json`);
} catch(ex) {
  console.error('[core]failed to load lifeObjects.json.');
  process.exit(1);
}

app.get('/:userName', (req, res) => {
  res.json(lifeObjects);
});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
})
