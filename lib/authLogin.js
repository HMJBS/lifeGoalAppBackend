const LocalStrategy = require('passport-local').Strategy
// mongodb model
const User = require('../models/User')

const localStorategy = new LocalStrategy(
  async function (userName, password, done) {
    let foundUser
    try {
      // search user
      foundUser = await User.findOne({ userName }).exec()
    } catch (err) {
      console.error(`Query Failed, cannnot find ${userName}`)
      return done(err)
    }
    if (!foundUser) {
      return done(null, false, { message: 'Incorrect user' })
    }
    if (!foundUser.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, foundUser)
  }
)

module.exports.localStorategy = localStorategy
