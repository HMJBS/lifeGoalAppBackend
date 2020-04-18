const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SingleObject = new Schema({
    
    name: {
        type: String, required: true, max: 50
    },
    layerDepth: {
        type: Number, required: true, 
    },
    finished: {
        type: Boolean, required: false, default: false
    },
    children: [{
        type: Schema.Types.ObjectId, 
    }],
    userName: {
        type: String
    }
});

module.exports = mongoose.model('SingleObject', SingleObject);