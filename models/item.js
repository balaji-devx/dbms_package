const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
});

module.exports = mongoose.model("Item", itemSchema);
