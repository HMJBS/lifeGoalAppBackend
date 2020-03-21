const express = require('express');
const app = express();
const process = require('process');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// load env file
if(!dotenv.config()) {
  throw new Error('dotenv failed.');
}

//import mongodb's model
const User = require(`${__dirname}/models/user.js`);

init();

const PORT = process.env.PORT || 7005;
const IP = process.env.HOST || 'localhost';

// needed for use req.body of application/json
app.use(cors());
app.use(express.json({}));

// server GET User instance
app.get('/user/:userName', (req, res) => {
  User.findOne( { userName: req.params.userName }).
    select('-userName').
    exec( (err, user) => {

    if (err) {

      console.error('[GET /user/:userName] error during query');
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (user === null) {
      console.log(`[GET /:userName]No entry for ${req.params.userName}`);
      res.status(404).send('Not Found.');
      return;
    }

    // remove lifeObjectsStr, instead insert lifeObjects
    console.log(user);

    res.status(200).send(user);
  });
});

// serve registering of User instance
app.post('/user', (req, res) => {

  console.log('inside post')
  const newUser = new User( { userName: req.body.userName });
  newUser.save((err) => {
    if (err) {
      console.error(`[POST /:userName]Can't save new user ${req.params.userName} on DB.`);
      console.error(err);
      res.status(500).send('Internal Server Error. Can\'t save to DB');
      return;
    }
    console.log(`[POST /user]Created user ${req.body.userName}`);
    res.set('Allow', 'GET, POST, HEAD, PUT, OPTIONS');
    res.status(201).send('Created.');
  });
});

app.put('/user/:userName', function(req, res) {

  User.updateOne( { userName: req.body.userName },
                  { lifeObjects: req.body.lifeObjects },
                  (err, updated) => {
                    if (err) {
                      console.error(`[POST /user/:userName] failed to update`);
                      console.error(err);
                      res.status(500).send('Internal Server Error');
                      return;
                    }
                    res.status(200).send('OK');
                  });
});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
});

function init() {

  mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, {userNewUrlParser: true});

}
