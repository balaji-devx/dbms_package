const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["L", "B"], // L = Lender, B = Borrower
    required: true
  }
});

module.exports = mongoose.model("Person", personSchema);
