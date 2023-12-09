const bcrypt = require("bcrypt");
const UserOtpSchema = require("../../MongoDb/models/userModels/Otp");
const mongoose = require("mongoose");
const phoneUserSchema = require("../../MongoDb/models/userModels/phoneUsers");
const ObjectId = mongoose.Types.ObjectId;
const springedge = require("springedge");
const dotenv = require("dotenv");
const User = require("../../MongoDb/models/userModels/User");
const Message = require("../../MongoDb/models/userModels/Message");
const formatTimestamp = require("../../utils/timestamp");
const {
  sortMessagesByTimestampDescending,
} = require("../../utils/sortTimestamp");

dotenv.config();

module.exports = {
  // Function to handle user signup
  doSignup: (userData, file) => {
    return new Promise(async (resolve, reject) => {
      // Hash the user's password
      userData.password = await bcrypt.hash(userData.password, 10);

      // Create a new User instance with the provided data
      const user = new User({
        email: userData.email,
        name: userData.name,
        profile: file,
        password: userData.password,
      });

      // Save the user to the database
      user
        .save(user)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  },

  // Function to handle user signin
  doSignIn: (userData) => {
    return new Promise(async (resolve, reject) => {
      // Find user by email
      const user = await User.findOne({ email: userData.email });

      if (user) {
        // Compare the provided password with the hashed password in the database
        let status = await bcrypt.compare(userData.password, user.password);

        if (status) {
          // If password is correct, create a data object with user details
          const data = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profile: user.profile,
          };
          resolve(data);
        } else {
          reject("Incorrect username or password");
        }
      } else {
        reject("Incorrect username or password");
      }
    });
  },

  // Function to fetch all users
  allUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch all users from the database
        User.find()
          .then((resp) => {
            resolve(resp);
          })
          .catch((err) => {
            console.log(err)
            reject("Something went wrong");
          });
      } catch (error) {
        reject("Something went wrong");
      }
    });
  },

  // Function to save a new message to the database
  saveMessage: ({ senderId, receiverId, content }) => {
    return new Promise(async (resolve, reject) => {
      let currentTime = new Date().toISOString();
      const timestamp = formatTimestamp(currentTime);

      // Create a new Message instance with the provided data
      const message = new Message({
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        timestamp: timestamp,
        readStatus: false,
      });

      // Save the message to the database
      message
        .save()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  },

  // Function to fetch messages between two users
  fetchMessages: ({ senderId, receiverId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch message history from the database
        const messages = await Message.find({
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        }).sort({ timestamp: -1 });

        // Sort messages by timestamp in descending order
        const sortedMessages = await sortMessagesByTimestampDescending(
          messages
        );
        resolve(sortedMessages);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Function to update the status of messages as read
  updateMsgStatus: ({ senderId, receiverId }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Update the status of messages to read
        await Message.updateMany(
          { senderId: receiverId, receiverId: senderId, readStatus: false },
          { $set: { readStatus: true } }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Function to delete a message by ID
  deleteMsg: (messageId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Delete a message from the database by ID
        await Message.deleteOne({ _id: new ObjectId(messageId) });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Function to update the online status of a user
  updateUserStatus: (userId, status) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Update the online status of a user in the database
        const data = await User.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              online: status,
            },
          },
          { upsert: true }
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};
