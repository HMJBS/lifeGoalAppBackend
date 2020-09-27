// import mongodb's model
const User = require(`${__dirname}/../models/User.js`)

module.exports.getObjectTree = function (req, res) {
  // search lifeobjects tree
  User.findOne({ userName: req.params.userName })
    .select('-userName')
    .populate('lifeObjects')
    .exec((err, user) => {
      if (err) {
        console.error('[GET /user/:userName] error during query')
        console.error(err)
        res.status(500).send('Internal Server Error')
        return
      }

      if (user === null) {
        console.log(`[GET /:userName]No entry for ${req.params.userName}`)
        res.status(404).send('Not Found.')
        return
      }

      // remove lifeObjectsStr, instead insert lifeObjects
      console.log(user)

      res.status(200).send(user)
    })
}
