const {Schema, model} = require('mongoose');

const schema = new Schema({
    refreshToken: {type: String, required: true, unique: true},
    user_id: {type: String, required: true}
}, {versionKey: false});

module.exports = model('RefreshToken', schema);