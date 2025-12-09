const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const hbs = require("hbs");

const app = express();

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/borrow_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(" MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Register partials if you want later
// hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Routes
const indexRoutes = require("./routes/index");
app.use("/", indexRoutes);


hbs.registerHelper("eq", function (a, b) {
    return a === b;
  });


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
