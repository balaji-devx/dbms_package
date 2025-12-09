const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Home
router.get("/", (req, res) => {
  res.render("home");
});

// =====================================
// PERSON CRUD
// =====================================

// List persons
router.get("/persons", (req, res) => {
  db.query("SELECT *, IF(type='L','Lender','Borrower') AS typeLabel FROM person", (err, persons) => {
    if (err) return res.send("DB Error");
    res.render("persons", { persons });
  });
});

// Add person
router.post("/persons/add", (req, res) => {
  const { name, mobile, type } = req.body;
  db.query("INSERT INTO person (name, mobile, type) VALUES (?, ?, ?)",
    [name, mobile, type],
    () => res.redirect("/persons")
  );
});

// Edit form
router.get("/persons/:id/edit", (req, res) => {
  db.query("SELECT * FROM person WHERE person_id=?", [req.params.id], (err, rows) => {
    const person = rows[0];
    res.render("person_edit", { person });
  });
});

// Update person
router.post("/persons/:id/edit", (req, res) => {
  const { name, mobile, type } = req.body;
  db.query("UPDATE person SET name=?, mobile=?, type=? WHERE person_id=?",
    [name, mobile, type, req.params.id],
    () => res.redirect("/persons")
  );
});

// Delete person
router.post("/persons/:id/delete", (req, res) => {
  db.query("DELETE FROM person WHERE person_id=?", [req.params.id], () => {
    res.redirect("/persons");
  });
});

// =====================================
// ITEM CRUD
// =====================================

// List items
router.get("/items", (req, res) => {
  db.query("SELECT * FROM item", (err, items) => {
    res.render("items", { items });
  });
});

// Add item
router.post("/items/add", (req, res) => {
  const { item_name, category } = req.body;
  db.query("INSERT INTO item (item_name, category) VALUES (?, ?)",
    [item_name, category],
    () => res.redirect("/items")
  );
});

// Edit form
router.get("/items/:id/edit", (req, res) => {
  db.query("SELECT * FROM item WHERE item_id=?", [req.params.id], (err, rows) => {
    res.render("item_edit", { item: rows[0] });
  });
});

// Update item
router.post("/items/:id/edit", (req, res) => {
  const { item_name, category } = req.body;
  db.query("UPDATE item SET item_name=?, category=? WHERE item_id=?",
    [item_name, category, req.params.id],
    () => res.redirect("/items")
  );
});

// Delete item
router.post("/items/:id/delete", (req, res) => {
  db.query("DELETE FROM item WHERE item_id=?", [req.params.id], () => {
    res.redirect("/items");
  });
});

// =====================================
// BORROW TRANSACTIONS
// =====================================

// Borrow form
router.get("/borrow", (req, res) => {
  db.query("SELECT * FROM item", (err, items) => {
    db.query("SELECT * FROM person WHERE type='L'", (err2, lenders) => {
      db.query("SELECT * FROM person WHERE type='B'", (err3, borrowers) => {
        res.render("borrow_form", { items, lenders, borrowers });
      });
    });
  });
});

// Insert borrow transaction
router.post("/borrow/add", (req, res) => {
  const { item_id, lender_id, borrower_id, borrow_date, due_date } = req.body;
  db.query(`INSERT INTO borrow_txn (item_id, lender_id, borrower_id, borrow_date, due_date)
            VALUES (?, ?, ?, ?, ?)`,
    [item_id, lender_id, borrower_id, borrow_date, due_date],
    () => res.redirect("/transactions")
  );
});

// List transactions
router.get("/transactions", (req, res) => {
  const sql = `
    SELECT bt.*, 
    p1.name AS lenderName,
    p2.name AS borrowerName,
    i.item_name
    FROM borrow_txn bt
    JOIN person p1 ON bt.lender_id=p1.person_id
    JOIN person p2 ON bt.borrower_id=p2.person_id
    JOIN item i ON bt.item_id=i.item_id
    ORDER BY borrow_date DESC`;

  db.query(sql, (err, txns) => {
    res.render("transactions", { txns });
  });
});

// Mark returned
router.post("/transactions/:id/return", (req, res) => {
  db.query("UPDATE borrow_txn SET return_date=CURDATE() WHERE txn_id=?",
    [req.params.id],
    () => res.redirect("/transactions")
  );
});

// Pending/Overdue
router.get("/pending", (req, res) => {
  const sql = `
    SELECT bt.*, p1.name AS lenderName, p2.name AS borrowerName, i.item_name,
    (bt.due_date < CURDATE()) AS isOverdue
    FROM borrow_txn bt
    JOIN person p1 ON bt.lender_id=p1.person_id
    JOIN person p2 ON bt.borrower_id=p2.person_id
    JOIN item i ON bt.item_id=i.item_id
    WHERE bt.return_date IS NULL
    ORDER BY bt.due_date ASC`;

  db.query(sql, (err, txns) => {
    res.render("pending", { txns });
  });
});

module.exports = router;
