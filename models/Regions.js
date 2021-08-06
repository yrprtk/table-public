const {Schema, model} = require('mongoose');

const schema = new Schema({
    region: {type: String, required: true},
    cities: {type: Array, required: true}
}, {versionKey: false});

module.exports = model('Regions', schema);