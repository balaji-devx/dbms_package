const express = require("express");
const router = express.Router();

const Person = require("../models/person");
const Item = require("../models/item");
const BorrowTxn = require("../models/borrowTxn");

// Home
router.get("/", async (req, res) => {
  res.render("home");
});

// ========== PERSON MANAGEMENT ==========

// List persons + add form
router.get("/persons", async (req, res) => {
  try {
    let persons = await Person.find().sort({ name: 1 }).lean();

    // Add a label for type so we don't need helpers in HBS
    persons = persons.map((p) => ({
      ...p,
      typeLabel: p.type === "L" ? "Lender" : "Borrower"
    }));

    res.render("persons", { persons });
  } catch (err) {
    console.error(err);
    res.send("Error loading persons");
  }
});

// Handle add person
router.post("/persons/add", async (req, res) => {
  try {
    const { name, mobile, type } = req.body;

    if (!name || !mobile || !type) {
      return res.send("All fields are required");
    }

    const person = new Person({ name, mobile, type });
    await person.save();
    res.redirect("/persons");
  } catch (err) {
    console.error(err);
    res.send("Error adding person");
  }
});

// Show edit form for person
router.get("/persons/:id/edit", async (req, res) => {
  try {
    const person = await Person.findById(req.params.id).lean();
    if (!person) {
      return res.send("Person not found");
    }

    // Flags for selected option in form
    person.isLender = person.type === "L";
    person.isBorrower = person.type === "B";

    res.render("person_edit", { person });
  } catch (err) {
    console.error(err);
    res.send("Error loading person for edit");
  }
});

// Handle edit person
router.post("/persons/:id/edit", async (req, res) => {
  try {
    const { name, mobile, type } = req.body;

    if (!name || !mobile || !type) {
      return res.send("All fields are required");
    }

    await Person.findByIdAndUpdate(req.params.id, {
      name,
      mobile,
      type
    });

    res.redirect("/persons");
  } catch (err) {
    console.error(err);
    res.send("Error updating person");
  }
});

// Delete person (only if not used in any transaction)
router.post("/persons/:id/delete", async (req, res) => {
  try {
    const id = req.params.id;

    const inUse = await BorrowTxn.findOne({
      $or: [{ lender_id: id }, { borrower_id: id }]
    });

    if (inUse) {
      return res.send(
        "Cannot delete this person because they are used in borrow transactions."
      );
    }

    await Person.findByIdAndDelete(id);
    res.redirect("/persons");
  } catch (err) {
    console.error(err);
    res.send("Error deleting person");
  }
});

// ========== ITEM MANAGEMENT ==========

// List items + add form
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ item_name: 1 }).lean();
    res.render("items", { items });
  } catch (err) {
    console.error(err);
    res.send("Error loading items");
  }
});

// Handle add item
router.post("/items/add", async (req, res) => {
  try {
    const { item_name, category } = req.body;

    if (!item_name || !category) {
      return res.send("All fields are required");
    }

    const item = new Item({ item_name, category });
    await item.save();
    res.redirect("/items");
  } catch (err) {
    console.error(err);
    res.send("Error adding item");
  }
});

// Show edit form for item
router.get("/items/:id/edit", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) {
      return res.send("Item not found");
    }
    res.render("item_edit", { item });
  } catch (err) {
    console.error(err);
    res.send("Error loading item for edit");
  }
});

// Handle edit item
router.post("/items/:id/edit", async (req, res) => {
  try {
    const { item_name, category } = req.body;

    if (!item_name || !category) {
      return res.send("All fields are required");
    }

    await Item.findByIdAndUpdate(req.params.id, {
      item_name,
      category
    });

    res.redirect("/items");
  } catch (err) {
    console.error(err);
    res.send("Error updating item");
  }
});

// Delete item (only if not used in any transaction)
router.post("/items/:id/delete", async (req, res) => {
  try {
    const id = req.params.id;

    const inUse = await BorrowTxn.findOne({ item_id: id });

    if (inUse) {
      return res.send(
        "Cannot delete this item because it is used in borrow transactions."
      );
    }

    await Item.findByIdAndDelete(id);
    res.redirect("/items");
  } catch (err) {
    console.error(err);
    res.send("Error deleting item");
  }
});

// ========== BORROW TRANSACTION ==========

// Show form to create borrow transaction
router.get("/borrow", async (req, res) => {
  try {
    const items = await Item.find().sort({ item_name: 1 }).lean();
    const persons = await Person.find().sort({ name: 1 }).lean();

    const lenders = persons.filter((p) => p.type === "L");
    const borrowers = persons.filter((p) => p.type === "B");

    res.render("borrow_form", { items, lenders, borrowers });
  } catch (err) {
    console.error(err);
    res.send("Error loading borrow form");
  }
});

// Handle new borrow transaction
router.post("/borrow/add", async (req, res) => {
  try {
    const { item_id, lender_id, borrower_id, borrow_date, due_date } = req.body;

    if (!item_id || !lender_id || !borrower_id || !borrow_date || !due_date) {
      return res.send("All fields are required");
    }

    const txn = new BorrowTxn({
      item_id,
      lender_id,
      borrower_id,
      borrow_date: new Date(borrow_date),
      due_date: new Date(due_date)
    });

    await txn.save();
    res.redirect("/transactions");
  } catch (err) {
    console.error(err);
    res.send("Error adding borrow transaction");
  }
});

// List all transactions
router.get("/transactions", async (req, res) => {
  try {
    const txns = await BorrowTxn.find()
      .populate("item_id")
      .populate("lender_id")
      .populate("borrower_id")
      .sort({ borrow_date: -1 })
      .lean();

    res.render("transactions", { txns });
  } catch (err) {
    console.error(err);
    res.send("Error loading transactions");
  }
});

// Mark transaction as returned
router.post("/transactions/:id/return", async (req, res) => {
  try {
    const txnId = req.params.id;
    const today = new Date();

    await BorrowTxn.findByIdAndUpdate(txnId, {
      return_date: today
    });

    res.redirect("/transactions");
  } catch (err) {
    console.error(err);
    res.send("Error updating return status");
  }
});

// Pending items (not returned yet) + overdue highlight
router.get("/pending", async (req, res) => {
  try {
    const today = new Date();
    const pendingTxns = await BorrowTxn.find({
      return_date: null
    })
      .populate("item_id")
      .populate("lender_id")
      .populate("borrower_id")
      .sort({ due_date: 1 })
      .lean();

    const txns = pendingTxns.map((t) => ({
      ...t,
      isOverdue: t.due_date < today
    }));

    res.render("pending", { txns });
  } catch (err) {
    console.error(err);
    res.send("Error loading pending report");
  }
});

module.exports = router;
