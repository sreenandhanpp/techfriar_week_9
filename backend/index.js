// server.js
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const connectDB = require("./MongoDb/connect.js");
const cors = require("cors");
const session = require("express-session");
const userRouter = require("./routes/userRoute.js");
const http = require("http");
const setupSocket = require("./Socket/index.js");
const path = require('path')

//compiling .env file
dotenv.config();

//taking the values from .env file
const PORT = process.env.PORT || 5000; // Use a default port if not specified
const MONGODB_URL = process.env.MONGODB_URL;

//creating the server from express library
const app = express();

//encoding the url to make the data passed through it to an object
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
    resave: false,
  })
);

app.use(express.static("uploads"));

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
);

// separates routes for normal user and admin (we call normal user as a user)
app.use("/user/api", userRouter);

const server = http.createServer(app);
// Setup Socket.IO
const io = setupSocket(server);

// function to start the server
const StartServer = (MONGODB_URL) => {
  // passing MongoDB URL to the database connecting function
  connectDB(MONGODB_URL);
  // make the server listen to the port
  server.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

StartServer(MONGODB_URL);
