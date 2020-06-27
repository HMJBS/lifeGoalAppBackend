const express = require('express');
const app = express();
const process = require('process');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// http method handlers
const getObjectTree = require('./lib/getObjectTree.js').getObjectTree;
const postNewUser = require('./lib/postNewUser.js').postNewUser;
const addNewNonRootObject = require('./lib/addNewNonRootObject.js').addNewNonRootObject;
const addNewRootObject = require('./lib/addNewRootObject.js').addNewRootObject;
const removeObject = require('./lib/removeObject.js').removeObject;

// load env file
if(!dotenv.config()) {
  throw new Error('dotenv failed.');
}

init();

const PORT = process.env.PORT || 7005;
const IP = process.env.HOST || 'localhost';

// needed for use req.body of application/json
app.use(cors());
app.use(express.json({}));

// get list of all life object tree (instance of SingleObject)
app.get('/user/:userName', getObjectTree);

// register new user
app.post('/user', postNewUser);

// add single oject to non-root oject
app.put('/user/:userName/:objectId', addNewNonRootObject);

// add single object to root object
app.put('/user/:userName/', addNewRootObject);

// remove object
app.delete('/user/:userName/:objectId', removeObject);

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`);
});

function init() {

  mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING,
    {useNewUrlParser: true, useUnifiedTopology: true });

}
