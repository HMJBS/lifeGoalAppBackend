const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

  // user name
  userName: {type: String, required: true, max: 20},

  // Id list of all lifeObject which belong to this user 
  lifeObjects: [{ type: Schema.Types.ObjectId, ref: 'SingleObject'}]
});

//export model
module.exports = mongoose.model('User', UserSchema);
