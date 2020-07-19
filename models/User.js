const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({

  // user name
  userName: { type: String, required: true, max: 20 },

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
UserSchema.methods.validPassword = function (rawPassword) {
  bcrypt.compare(rawPassword, this.hash)
    .then((result) => { return result })
    .catch((err) => {
      console.error(`error while hash comparing\n${err}`)
      throw new Error(`error while hash comparing\n${err}`)
    })
}

// export model
module.exports = mongoose.model('User', UserSchema)
