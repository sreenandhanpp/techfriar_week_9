//importing modules
const mongoose = require('mongoose');


//defining the structure of the collection
const newUserSchema = new mongoose.Schema({
    phone: {
        type:String,
        required:true,
        unique:true
    },
    isVerified:{
        type:Boolean,
        required: true
    }
});

//creating the model
const phoneUserSchema = mongoose.model('phoneUser',newUserSchema);

module.exports = phoneUserSchema;