const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({

  // user name
  userName: { type: String, unique: true, required: true, max: 20 },

  // Id list of all lifeObject which belong to this user
  lifeObjects: [{ type: Schema.Types.ObjectId, ref: 'SingleObject' }],

  // bcrypt password hash
  hash: { type: String, max: 60 },

  // salt rounds to create hash
  saltRounds: { type: Number, required: true }
})

/**
 * check rawpassword to match user hash
 * @param {String} rawPassword password to check hash
 * @returns {Boolean}
 */
UserSchema.methods.validPassword = async function (rawPassword) {
  console.debug(`comparing pass ${rawPassword} to hash ${this.hash}`)
  try {
    const result = await bcrypt.compare(rawPassword, this.hash)
    return result
  } catch (err) {
    console.error(`error while hash comparing\n${err}`)
    throw err
  }
}

// apply unique validator
UserSchema.plugin(uniqueValidator)
// export model
module.exports = mongoose.model('User', UserSchema)
