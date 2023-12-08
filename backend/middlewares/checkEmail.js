const { body, validationResult } = require("express-validator");
const User = require("../MongoDb/models/userModels/User.js");

//validaing form

module.exports = [
  // Validate email
  body("email")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already exists");
      }
      return true;
    }),
];
