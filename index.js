const express = require('express');
const app = express();
const process = require('process');
const mongoose = require('mongoose');

//import mongodb's model
const User = require(`${__dirname}/models/user.js`);

const PORT = process.env.PORT || 7005;
const IP = process.env.HOST ||' localhost';

init();

// server GET User instance
app.get('/:userName', (req, res) => {
  User.findOne( { userName: req.params.userName }, (err, user) => {
    if (err) {
      console.log(`[GET /:userName]No entry for ${req.params.userName}`);
      res.status(404).send('Not Found.');
      return;
    }

    let parsedObj;
    try {
      parsedObj = JSON.parse(user.lifeObjects);
    } catch (err) {

      console.error(`[GET /:userName] Invalid JSON in User.LifeObjects`);
      res.status(500).send('Internal Server Error');
      return;

    }
    res.status(200).send(parsedObj);
  });
});

// serve registering of User instance
app.post('/:userName', (req, res) => {

  const newUser = new User(req.params.userName);
  newUser.save((err) => {
    if (err) {
      console.error(`[POST /:userName]Can't save new user ${req.params.userName} on DB.`);
      console.error(err);
      res.status(500).send('Internal Server Error. Can\'t save to DB');
      return;
    }
    res.status(201).send('Created.');
  });
});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
});

function init() {

  // load env file
  const dotenv = require('dotenv').config();
  mongoose.connect(process.env.MONGOOSE_HOST, {userNewUrlParser: true});

}
