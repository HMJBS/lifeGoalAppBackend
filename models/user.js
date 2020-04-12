const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

  userName: {type: String, required: true, max: 20},
  lifeObjects: [{ type: Schema.Types.ObjectId, ref: 'SingleObject'}]
});

//export model
module.exports = mongoose.model('User', UserSchema);
