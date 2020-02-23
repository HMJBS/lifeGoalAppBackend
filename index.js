const express = require('express');
const app = express();
const fs = require('fs');
const process = require('process');

const PORT = 7005;
const IP = 'localhost';

let lifeGoal;
try {
  lifeGoal = require(`${__dirname}/json/lifeGoal.json`);
} catch(ex) {
  console.error('[core]failed to load lifeGoal.json.');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.json(lifeGoal);
});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
})
