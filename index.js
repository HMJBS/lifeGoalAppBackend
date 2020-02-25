const express = require('express');
const app = express();
const fs = require('fs');
const process = require('process');

const PORT = 7005;
const IP = 'localhost';

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
