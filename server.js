const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");

const app = express();

// Load DB
require("./config/db");

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Helpers
hbs.registerHelper("formatDate", function (date) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
});

// Fix missing helper
hbs.registerHelper("eq", (a, b) => a === b);

// New helper for sticky selected values
hbs.registerHelper("ifEquals", function (a, b, opts) {
  return a == b ? opts.fn(this) : opts.inverse(this);
});

// Routes
app.use("/", require("./routes/index"));

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
