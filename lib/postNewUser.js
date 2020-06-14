//import mongodb's model
const User = require(`${__dirname}/../models/User.js`);

module.exports.postNewUser = function (req, res) {
  const newUser = new User({ userName: req.body.userName });
  newUser.save((err) => {
    if (err) {
      console.error(
        `[POST /:userName]Can't save new user ${req.params.userName} on DB.`
      );
      console.error(err);
      res.status(500).send("Internal Server Error. Can't save to DB");
      return;
    }
    console.log(`[POST /user]Created user ${req.body.userName}`);
    res.status(201).send("Created");
  });
};
