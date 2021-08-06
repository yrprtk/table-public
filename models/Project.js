const {Schema, model} = require('mongoose');

const schema = new Schema({
    registrationDate: {type: String, required: true},
    region: {type: String, required: true},
    city: {type: String, required: true},
    medicalInstitution: {type: String, required: true},
    contactPersonName: {type: String, required: true},
    contactPersonEmail: {type: String, required: true},
    contactPersonPhone: {type: String, required: true},
    contactPersonPost: {type: String, required: true},
    projectPrice: {type: String, required: true},
    projectСurrency: {type: String, required: true},
    financingSource: {type: String, required: true},
    financingSourceType: {type: String, required: true},
    chance: {type: String, required: true},
    projectInfo: {type: String, required: true},
    equipmentType: {type: String, required: true},
    equipmentName: {type: String, required: true},
    helpSalesResponsible: {type: String, required: true},
    kpInfo: {type: String, required: true},
    notes: {type: String, required: true},
    status: {type: String, required: true},
    user_email: {type: String, required: true},
    lastUpdate: {type: String, required: true},
    isDelete: {type: String, required: false}
}, {versionKey: false});

module.exports = model('Project', schema);