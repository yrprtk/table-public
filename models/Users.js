const {Schema, model} = require('mongoose');

const schema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, required: true}
}, {versionKey: false});

module.exports = model('Users', schema);