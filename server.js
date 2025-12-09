const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Load MySQL connection
require("./config/db");

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", require("./routes/index"));

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
