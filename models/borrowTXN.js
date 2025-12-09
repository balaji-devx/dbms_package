const mongoose = require("mongoose");

const borrowTxnSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true
  },
  lender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true
  },
  borrower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Person",
    required: true
  },
  borrow_date: {
    type: Date,
    required: true
  },
  due_date: {
    type: Date,
    required: true
  },
  return_date: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("BorrowTxn", borrowTxnSchema);
