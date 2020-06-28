//import mongodb's model
const User = require(`${__dirname}/../models/User.js`);
const SingleObject = require(`${__dirname}/../models/SingleObject.js`);

module.exports.addNewNonRootObject = async function (req, res) {
  const newObjectId = req.params.objectId;
  const requesterUserName = req.params.userName;
  let owner;

  // find owner user
  try {
    owner = await User.findOne({ userName: requesterUserName }).exec();
    if (!owner) throw new Error("Not Found");
  } catch (err) {
    console.error(`Can't find user ${requesterUserName}`);
    console.error(err);
    res.status(400).send(`Can't find user ${requesterUserName}\r${err}`);
  }

  // find target SingleObject
  let parentObject;
  try {
    parentObject = await SingleObject.findById(newObjectId).exec();
    if (!owner) throw new Error("Not Found");
  } catch (err) {
    console.error(`error during find SingleObject ${newObjectId}`);
    console.error(err);
    res.status(500).send(`error for find SingleObject ${newObjectId}\n${err}`);
    return;
  }

  // reject if singleObject.layerDepth is deeper than 3
  if (parentObject.layerDepth > 3) {
    console.log(`Request Object ${newObjectId} is too deep`);
    res.status(400).send(`Request Object ${newObjectId} is too deep`);
    return;
  }

  // create new single Object on DB
  const newSingleObject = new SingleObject({
    name: req.body.name,
    layerDepth: parentObject.layerDepth + 1,
    finished: false,
    owner: owner._id,
  });

  // save new singleObject
  try {
    await newSingleObject.save();
  } catch (err) {
    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${requesterUserName}/${newObjectId}`);
    console.error(err);

    res.status(500).send("failed to save new single object");
    return;
  }

  // update it's child and save
  parentObject.children.push(newSingleObject._id);

  try {
    await parentObject.save();
  } catch (err) {
    console.error(`failed to save new SingleObject`);
    console.error(`aborting, PUT /user/${requesterUserName}/${newObjectId}`);
    console.error(err);

    // remove already saved newSingleObject
    await SingleObject.findyByIdAndRemove(newSingleObject._id);

    res.status(400).send("failed to save new singleObject's index");
    return;
  }

  // update owner's children
  owner.lifeObjects.push(newSingleObject._id);

  try {
    await owner.save();
  } catch (err) {
    console.error(`failed to update owner User doc`);
    console.error(`aborting, PUT /user/${requesterUserName}/${newObjectId}`);
    console.error(err);

    // remove already saved newSingleObject
    await SingleObject.findyByIdAndRemove(newSingleObject._id);

    res.status(400).send("failed to save new singleObject's index");
    return;
  }

  // return created goal object
  res.status(200).send(newSingleObject);
  console.log(`PUT /user/${requesterUserName}/${newObjectId}`);
};
