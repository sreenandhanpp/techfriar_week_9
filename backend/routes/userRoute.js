// import express from 'express';
const express = require("express");
const userHelper = require("../helpers/userHelper");
const checkEmail = require("../middlewares/checkEmail");
const upload = require("../utils/multer");
const deleteImage = require("../utils/deleteImage");
const { validationResult } = require("express-validator");
const router = express.Router();

// Signup route for form submission
router.post(
  "/signup",
  upload.single("profile"), // Middleware for handling profile image uploads
  checkEmail, // Middleware to check if the email already exists
  async (req, res) => {
    try {
      const err = validationResult(req);

      if (!err.isEmpty()) {
        deleteImage(req.file.filename); // Delete uploaded image in case of validation error
        throw "Email already exists";
      } else {
        // User signup process
        userHelper
          .doSignup(req.body, req.file.filename) // Call helper function for signup
          .then((data) => {
            req.session.user = data; // Store user session data
            res.json(data).status(200);
          })
          .catch((err) => {
            res.status(400).json({ message: err });
          });
      }
    } catch (error) {
      res.status(401).json({ message: error });
    }
  }
);

// Get all users route
router.get("/all-users", (req, res) => {
  // Fetch all users
  userHelper
    .allUsers()
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});

// Signin route for login form submission
router.post("/signin", (req, res) => {
  // User login process
  userHelper
    .doSignIn(req.body)
    .then((data) => {
      req.session.user = data; // Store user session data
      res.json(data).status(200);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});

// Fetch messages route
router.post("/all-messages", (req, res) => {
  // Fetch messages for a specific user
  userHelper
    .fetchMessages(req.body)
    .then((data) => {
      res.json(data).status(200);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});

// Update message status route
router.post("/update-message-status", (req, res) => {
  // Update the status of a specific message
  userHelper
    .updateMsgStatus(req.body)
    .then(() => {
      res.status(200);
    })
    .catch((err) => {
      res.status(400).json({ message: err });
    });
});


module.exports = router;
