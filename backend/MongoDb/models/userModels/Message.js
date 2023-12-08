const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const messageSchema = new mongoose.Schema({
  senderId: {
    type: ObjectId,
    ref: "User", // Replace 'User' with the actual model name for users
    required: true,
  },
  receiverId: {
    type: ObjectId,
    ref: "User", // Replace 'User' with the actual model name for users
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
  },
  readStatus: {
    type: Boolean,
    default: false,
    required: true
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
