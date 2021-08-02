// app.js

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const routes = require("./routes/routes"); // Imports routes for the products
const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
const dev_db_url = "mongodb://localhost:27017/storageApp";
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", routes);

const port = 3000;

app.listen(port, () => {
  console.log("Server is up and running on port number " + port);
});
