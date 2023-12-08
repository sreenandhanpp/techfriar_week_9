//importing modules
const mongoose = require("mongoose");

//defining the structure of the collection
const newUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
  },
  online: {
    type: Boolean,
  },
});

//creating the model
const User = mongoose.model("User", newUserSchema);

module.exports = User;
