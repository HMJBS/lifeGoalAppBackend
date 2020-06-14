//import mongodb's model
const User = require(`${__dirname}/../models/User.js`);
const SingleObject = require(`${__dirname}/../models/SingleObject.js`);

module.exports.addNewRootObject = async function (req, res) {
  // check User existance
  let parentUser;
  try {

    parentUser = await User.findOne({ userName: req.params.userName }).exec();

  } catch (err) {

    console.error(`Error during find user ${req.params.userName}`);
    res.status(500).send(`Error during find user ${req.params.userName}`);
    return;

  }

  if (!parentUser) {

    console.error(`PUT /user/${req.params.userName} No such user`);
    res.status(400).send(`No such User ${req.params.userName}`);
    return;

  }

  const newRootSingleOject = new SingleObject({
    name: req.body.name,
    layerDepth: 0,
    finished: req.body.finished,
    owner: parentUser._id
  });

  try {

    // save new single Oject
    const resultDoc = await newRootSingleOject.save();

    console.debug(`newRootSingleOject.id is ${resultDoc._id}`);
    
    // add _id of this to User object
    parentUser.lifeObjects.push(resultDoc._id);

    await parentUser.save();

  } catch (err) {

    console.error(`failed to PUT /user/${req.params.userName}`);
    console.error(err);

    // rollback new object
    res.status(500).send(`failed to PUT /user/${req.params.userName}`);
    return

  }

  console.log(`PUT /user/${req.params.userName}`);
  res.status(200).send('done');

}