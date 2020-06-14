//import mongodb's model
const User = require(`${__dirname}/../models/User.js`);
const SingleObject = require(`${__dirname}/../models/SingleObject.js`);

module.exports.addNewNonRootObject = async function (req, res) {

    let owner;
    try {
  
      // find owner user
      owner = await User.findOne({userName: req.params.userName}).exec();
    
    } catch (err) {
  
      console.error(`Can't find user ${req.params.userName}`);
      res.status(400).send(`Can't find user ${req.params.userName}`);
    
    }
  
    let parentObject;
    try {
  
      // find target SingleObject
      parentObject = await SingleObject.findById(req.params.objectId).exec();
  
    } catch (err) {
  
      console.error(`error during find SingleObject ${req.params.objectId}`);
      res.status(500).send(`error for find SingleObject ${req.params.objectId}`);
      return;
  
    }
  
    if (!parentObject) {
  
      console.error(`PUT /user/${req.params.userName}/${req.params.objectId}`);
      console.error(`no such parent object`);
  
      res.status(400).send(`no such parent object ${req.params.objectId}`);
      return;
  
    }
  
    // reject if singleObject.layerDepth is deeper than 3
    if (parentObject.layerDepth > 3) {
  
      res.status(400).send('too deep to put');
      return;
  
    }
  
    // create new single Object
    const newSingleObject = new SingleObject({
      name: req.body.name,
      layerDepth: parentObject.layerDepth + 1,
      finished: false,
      owner: owner._id
    });
  
    try {
  
      // save new singleObject
      await newSingleObject.save();
  
    } catch (err) {
  
      console.error(`failed to save new SingleObject`);
      console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
      console.error(err);
  
      res.status(500).send('failed to save new single object');
      return;
  
    }
  
    // update it's child
    parentObject.children.push(newSingleObject._id);
  
    try {
  
      await parentObject.save();
  
    } catch (err) {
  
      console.error(`failed to save new SingleObject`);
      console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
      console.error(err);
  
      // remove already saved newSingleObject
      await SingleObject.findyByIdAndRemove(newSingleObject._id);
      
      res.status(400).send('failed to save new singleObject\'s index');
      return;
    }
  
    // update owner's children
    owner.lifeObjects.push(newSingleObject._id);
  
    try {
  
      await owner.save();
  
    } catch (err) {
  
      console.error(`failed to update owner User doc`);
      console.error(`aborting, PUT /user/${req.params.userName}/${req.params.objectId}`);
      console.error(err);
  
      // remove already saved newSingleObject
      await SingleObject.findyByIdAndRemove(newSingleObject._id);
      
      res.status(400).send('failed to save new singleObject\'s index');
      return;
    }
  
    res.status(200).send(newSingleObject);
    console.log(`PUT /user/${req.params.userName}/${req.params.objectId}`)
}