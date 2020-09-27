const express = require('express')
const app = express()
const process = require('process')
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')

// http method handlers
const getObjectTree = require('./lib/getObjectTree.js').getObjectTree
const postNewUser = require('./lib/postNewUser.js').postNewUser
const addNewNonRootObject = require('./lib/addNewNonRootObject.js').addNewNonRootObject
const addNewRootObject = require('./lib/addNewRootObject.js').addNewRootObject
const removeObject = require('./lib/removeObject.js').removeObject

// passportjs storategy configurator
const localStorategy = require('./lib/authLogin.js').localStorategy

// only development
if (process.env.NODE_ENV === 'development') {
  console.log('use development env')
  const dotenv = require('dotenv')
  if (!dotenv.config()) {
    throw new Error('dotenv failed.')
  }
}

init()

const PORT = 7005
const IP = '0.0.0.0'

// needed for use req.body of application/json
app.use(cors({
  credentials: true,
  origin: true
}))
app.use(express.json({}))
app.use(session({
  secret: 'whatMakesMeAGoodDemoman'
}))
app.use(passport.initialize())
app.use(passport.session())

// get list of all life object tree (instance of SingleObject)
app.get('/user/:userName', isAuthorized, getObjectTree)

// register new user
app.post('/user', postNewUser)

// login
app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log(`login: ${req.user}`)
  res.status(200).send('OK')
})

// logout
app.get('/logout', (req, res) => {
  req.logout()
  console.log(`logout: ${req.user}`)
  res.sendStatus(200)
})

// add single oject to non-root oject
app.put('/user/:userName/:objectId', isAuthorized, addNewNonRootObject)

// add single object to root object
app.put('/user/:userName/', isAuthorized, addNewRootObject)

// remove object
app.delete('/user/:userName/:objectId', isAuthorized, removeObject)

app.listen(PORT, IP, () => {
  console.log(`[core]start listerning at ${PORT}`)
})

function isAuthorized(req, res, next) {
  if (req.user.userName === req.params.userName) {
    next()
  } else {
    res.sendStatus(403)
  }
}

function init () {
  const User = require('./models/User')
  mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING,
    { useNewUrlParser: true, useUnifiedTopology: true })

  passport.use(localStorategy)

  passport.serializeUser(function (user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user)
    })
  })
}
