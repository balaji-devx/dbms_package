const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const hbs = require("hbs");

const app = express();

// Load MySQL connection (ensure config/db.js exists)
require("./config/db");

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// View engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Optional: a small helper for formatting dates (yyyy-mm-dd)
hbs.registerHelper("formatDate", function (date) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
});

// Routes
app.use("/", require("./routes/index"));

hbs.registerHelper("eq", function(a, b) {
  return a === b;
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
