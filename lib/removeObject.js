// import mongodb's model
const User = require(`${__dirname}/../models/User.js`)
const SingleObject = require(`${__dirname}/../models/SingleObject.js`)

/**
 * remove given object
 * REST Parameters
 *
 * @param {*} req request object
 * @param {String} req.params.userName object's owner userName
 * @param {String} req.params.objectId object's Id
 * @param {*} res response object
 */
module.exports.removeObject = async function (req, res) {
  // find owner user
  let owner
  try {
    owner = await User.findOne({ userName: req.params.userName }).exec()
  } catch (err) {
    console.error(`Can't find user ${req.params.userName}`)
    res.status(400).send(`Can't find user ${req.params.userName}`)
    return
  }

  // find target SingleObject
  let targetObject
  try {
    targetObject = await SingleObject.findById(req.params.objectId).exec()
    if (targetObject === null) throw new Error("Target Object doesn't exist")
  } catch (err) {
    console.error(`error during find SingleObject ${req.params.objectId}`)
    console.error(err)
    res
      .status(500)
      .send(`error for find SingleObject ${req.params.objectId}\n${err}`)
    return
  }

  // check given user is owner of targetObject
  if (owner._id == targetObject.owner) {
    console.error(
      `Can't remove object ${targetObject._id}, given user ${targetObject.owner} is not owner ${owner._id}`
    )
    res
      .status(400)
      .send(
        `Can't remove object ${targetObject._id}, given user ${targetObject.owner} is not owner ${owner._id}`
      )
    return
  }

  // check targetObject has no child
  if (targetObject.children && targetObject.children.length !== 0) {
    // don't remove object cuz there is children
    console.error(`Can't remove object ${targetObject._id}, has children`)
    res.status(400).send(`Object ${targetObject._id} has children`)
    return
  }

  // delete object
  try {
    const deletedObject = await SingleObject.deleteOne({
      _id: targetObject._id
    }).exec()
    if (!deletedObject) throw new Error('Not found')
  } catch (err) {
    console.error(`Can't remove object ${targetObject._id}, comm failed`)
    res.status(400).send(`Object ${targetObject._id} ,comm failed`)
    return
  }

  // send reply
  res.status(200).send(`Delted object ${targetObject._id}`)
  console.log(`Delted object ${targetObject._id}`)
}
