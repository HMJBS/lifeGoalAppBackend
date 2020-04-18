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
const User = require(`${__dirname}/models/User.js`);
const SingleObject = require(`${__dirname}/models/SingleObject.js`);

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

  const newUser = new User( { userName: req.body.userName });
  newUser.save((err) => {

    if (err) {
      console.error(`[POST /:userName]Can't save new user ${req.params.userName} on DB.`);
      console.error(err);
      res.status(500).send('Internal Server Error. Can\'t save to DB');
      return;
    }
    console.log(`[POST /user]Created user ${req.body.userName}`);
    res.status(201).send('Created');

  });
});

/**
 * add single oject to non-root oject
 */
app.put('/user/:userName/:objectId', async (req, res) => {

  // find target SingleObject
  const targetSingleObject = SingleObject.findById(req.params.objectId); 

  // reject if singleObject.layerDepth is deeper than 3
  if (targetSingleObject.layerDepth >= 3) {

    res.status(400).send('too deep to put');
    return;
  }

  // create new single Object
  const newSingleObject = new SingleObject({
    name: req.body.name,
    layerDepth: targetSingleObject.layerDepth + 1,
    finished: false,
    children: []
  });

  try {

    await newSingleObject.save();

  } catch (err) {

    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(err);

    res.status(500).send('failed to save new single object');
    return;

  }

  // update it's child
  targetSingleObject.children.put(newSingleObject._id);

  try {

    await targetSingleObject.save();

  } catch (err) {

    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(err);

    // remove already saved newSingleObject
    await SingleObject.findyByIdAndRemove(newSingleObject._id);
    
    res.status(400).send('failed to save new singleObject\'s index');
    return;
  }

  res.status(200).send('OK');
});

app.put('/user/:userName/', async (req, res) => {

  // check User existance
  const parentUser = User.findOne({ userName: req.params.userName });
  if (!parentUser) {
    
    console.error(`PUT /user/${req.params.userName} No such user`);
    res.status(400).send(`No such User ${req.params.userName}`);
    return;
  }

  const newRootOject = new SingleObject({
    name: req.body.name,
    layerDepth: 0,
    finished: req.body.finished,
  });

  try {

    // save new single Oject
    const result = await newRootOject.save();
    
    // add _id of this to User object
    parentUser.lifeObjects.push(result._id);

    await parentUser.save();

    console.log(`PUT /user/${req.body.userName}}`);

  } catch(err) {

    console.err(`failed to PUT /user/${req.body.userName}}`);
  }

});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
});

function init() {

  mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING, {userNewUrlParser: true});

}
