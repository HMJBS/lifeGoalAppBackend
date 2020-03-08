const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const defaultLifeObjects = require(`${__dirname}/../json/lifeObjects.json`);
const lifeObjectsValidator = require(`${__dirname}/../models/validators/user.validator.js`);

const UserSchema = new Schema({

  userName: {type: String, required: true, max: 20},
  lifeObjects: {
    type: String,
    default: JSON.stringify(defaultLifeObjects),
    max: 8192,
    validate: {
      validator: lifeObjectsValidator,
      message: 'Invalid lifeObjects'
    }
  }
});

//export model
module.exports = mongoose.model('User', UserSchema);
