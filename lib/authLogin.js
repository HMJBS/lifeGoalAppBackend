const LocalStrategy = require('passport-local').Strategy
// mongodb model
const User = require('../models/User')

const localStorategy = new LocalStrategy({
  usernameField: 'userName',
  passwordField: 'password'
},
async function (username, password, done) {
  let foundUser
  try {
    // search user
    foundUser = await User.findOne({ userName: username }).exec()
  } catch (err) {
    console.error(`Query Failed, cannnot find ${username}`)
    return done(err)
  }
  if (!foundUser) {
    return done(null, false, { message: 'Incorrect user' })
  }
  const isValid = await foundUser.validPassword(password)
  if (!isValid) {
    return done(null, false, { message: 'Incorrect password.' })
  }
  return done(null, foundUser)
})

module.exports.localStorategy = localStorategy
