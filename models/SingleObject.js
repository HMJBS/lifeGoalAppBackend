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
        type: Schema.Types.ObjectId, ref: 'SingleObject', required: false
    }],
    owner: {
        type: Schema.Types.ObjectId, ref: 'User', requred: true
    }
});

module.exports = mongoose.model('SingleObject', SingleObject);