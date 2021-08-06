const {Schema, model} = require('mongoose');

const schema = new Schema({
    equipmentType: {type: String, required: true},
    equipmentName: {type: Array, required: true}
}, {versionKey: false});

module.exports = model('Equipments', schema);