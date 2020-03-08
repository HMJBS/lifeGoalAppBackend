const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const defaultLifeObjects = require(`${__dirname}/json/lifeObjects.json`);
const UserSchema = new Schema({

  userName: {type: String, required: true, max: 20},
  password: {type: String, required: true, max: 50},
  lifeObjects: {type: String, default: JSON.stringify(defaultLifeObjects), max: 8192}
});

//export model
module.exports = mongoose.model('User', UserSchema);
