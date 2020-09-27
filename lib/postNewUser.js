// import mongodb's model
const User = require(`${__dirname}/../models/User.js`)
const bcrypt = require('bcrypt')

module.exports.postNewUser = async function (req, res) {
  // check value userName, password is not falsy
  const userName = req.body.userName
  if (!userName) throw new Error('No userName')
  const password = req.body.password
  if (!password) throw new Error('No password')

  const saltRounds = parseInt(process.env.HASH_SALT_ROUND_DEFAULT)
  const hash = await bcrypt.hash(password, saltRounds)
  const newUser = new User({ userName, hash, saltRounds })
  newUser.save((err) => {
    if (err) {
      console.error(
        `[POST /:userName]Can't save new user ${req.params.userName} on DB.`
      )
      console.error(err)
      res.status(500).send(err.message)
      return
    }
    console.log(`[POST /user]Created user ${req.body.userName}`)
    res.status(201).send('Created')
  })
}
