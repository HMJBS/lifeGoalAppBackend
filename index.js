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

// get list of all life object tree (instance of SingleObject)
app.get('/user/:userName', (req, res) => {
  User.findOne( { userName: req.params.userName }).
    select('-userName').
    populate('lifeObjects').
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

// register new user
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

  let owner;
  try {

    // find owner user
    owner = await User.findOne({userName: req.params.userName}).exec();
  
  } catch (err) {

    console.error(`Can\'t find user ${req.params.userName}`);
    res.status(400).send(`Can\'t find user ${req.params.userName}`);
  
  }

  let parentObject;
  try {

    // find target SingleObject
    parentObject = await SingleObject.findById(req.params.objectId).exec();

  } catch (err) {

    console.error(`error during find SingleObject ${req.params.objectId}`);
    res.status(500).send(`error for find SingleObject ${req.params.objectId}`);
    return;

  }

  if (!parentObject) {

    console.error(`PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(`no such parent object`);

    res.status(400).send(`no such parent object ${req.params.objectId}`);
    return;

  }

  // reject if singleObject.layerDepth is deeper than 3
  if (parentObject.layerDepth >= 3) {

    res.status(400).send('too deep to put');
    return;

  }

  // create new single Object
  const newSingleObject = new SingleObject({
    name: req.body.name,
    layerDepth: parentObject.layerDepth + 1,
    finished: false,
    owner: owner._id
  });

  try {

    // save new singleObject
    await newSingleObject.save();

  } catch (err) {

    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(err);

    res.status(500).send('failed to save new single object');
    return;

  }

  // update it's child
  parentObject.children.push(newSingleObject._id);

  try {

    await parentObject.save();

  } catch (err) {

    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(err);

    // remove already saved newSingleObject
    await SingleObject.findyByIdAndRemove(newSingleObject._id);
    
    res.status(400).send('failed to save new singleObject\'s index');
    return;
  }

  // update owner's children
  owner.lifeObjects.push(newSingleObject._id);

  try {

    await owner.save();

  } catch (err) {

    console.error(`failed to update owner User doc`);
    console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
    console.error(err);

    // remove already saved newSingleObject
    await SingleObject.findyByIdAndRemove(newSingleObject._id);
    
    res.status(400).send('failed to save new singleObject\'s index');
    return;
  }

  res.status(200).send(newSingleObject);
  console.log(`PUT /user/${req.params.userName}/${req.params.objectId}`)

});

app.put('/user/:userName/', async (req, res) => {

  // check User existance

  let parentUser;
  try {

    parentUser = await User.findOne({ userName: req.params.userName }).exec();

  } catch (err) {

    console.error(`Error during find user ${req.params.userName}`);
    res.status(500).send(`Error during find user ${req.params.userName}`);
    return;

  }

  if (!parentUser) {

    console.error(`PUT /user/${req.params.userName} No such user`);
    res.status(400).send(`No such User ${req.params.userName}`);
    return;

  }

  const newRootSingleOject = new SingleObject({
    name: req.body.name,
    layerDepth: 0,
    finished: req.body.finished,
    owner: parentUser._id
  });

  try {

    // save new single Oject
    const resultDoc = await newRootSingleOject.save();

    console.debug(`newRootSingleOject.id is ${resultDoc._id}`);
    
    // add _id of this to User object
    parentUser.lifeObjects.push(resultDoc._id);

    await parentUser.save();

  } catch (err) {

    console.error(`failed to PUT /user/${req.params.userName}`);
    console.error(err);

    // rollback new object
    res.status(500).send(`failed to PUT /user/${req.params.userName}`);
    return

  }

  console.log(`PUT /user/${req.params.userName}`);
  res.status(200).send('done');

});

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
});

function init() {

  mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING,
    {useNewUrlParser: true, useUnifiedTopology: true });

}
