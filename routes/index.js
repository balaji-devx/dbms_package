const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Home
router.get("/", (req, res) => {
  res.render("home");
});

// ========== PERSON CRUD ==========

// List persons
router.get("/persons", (req, res) => {
  db.query("SELECT *, IF(type='L','Lender','Borrower') AS typeLabel FROM person", (err, persons) => {
    if (err) {
      console.error("Person list error:", err);
      return res.status(500).send("DB error");
    }
    res.render("persons", { persons });
  });
});

// Add person
router.post("/persons/add", (req, res) => {
  const { name, mobile, type } = req.body;
  db.query("INSERT INTO person (name, mobile, type) VALUES (?, ?, ?)",
    [name, mobile, type],
    (err) => {
      if (err) {
        console.error("Person insert error:", err);
        return res.status(500).send("DB error: " + err.message);
      }
      res.redirect("/persons");
    }
  );
});

// Edit form
router.get("/persons/:id/edit", (req, res) => {
  db.query("SELECT * FROM person WHERE person_id=?", [req.params.id], (err, rows) => {
    if (err) {
      console.error("Person select error:", err);
      return res.status(500).send("DB error");
    }
    if (!rows || rows.length === 0) return res.status(404).send("Person not found");
    const person = rows[0];
    res.render("person_edit", { person });
  });
});

// Update person
router.post("/persons/:id/edit", (req, res) => {
  const { name, mobile, type } = req.body;
  db.query("UPDATE person SET name=?, mobile=?, type=? WHERE person_id=?",
    [name, mobile, type, req.params.id],
    (err) => {
      if (err) {
        console.error("Person update error:", err);
        return res.status(500).send("DB error: " + err.message);
      }
      res.redirect("/persons");
    }
  );
});

// Delete person (pre-check if used in transactions)
router.post("/persons/:id/delete", (req, res) => {
  const id = req.params.id;
  db.query("SELECT 1 FROM borrow_txn WHERE lender_id=? OR borrower_id=? LIMIT 1", [id, id], (err, rows) => {
    if (err) {
      console.error("Person delete check error:", err);
      return res.status(500).send("DB error");
    }
    if (rows && rows.length > 0) {
      return res.status(400).send("Cannot delete: person used in transactions.");
    }
    db.query("DELETE FROM person WHERE person_id=?", [id], (err2) => {
      if (err2) {
        console.error("Person delete error:", err2);
        return res.status(500).send("DB error");
      }
      res.redirect("/persons");
    });
  });
});

// ========== ITEM CRUD ==========

// List items
router.get("/items", (req, res) => {
  db.query("SELECT * FROM item", (err, items) => {
    if (err) {
      console.error("Item list error:", err);
      return res.status(500).send("DB error");
    }
    res.render("items", { items });
  });
});

// Add item
router.post("/items/add", (req, res) => {
  const { item_name, category } = req.body;
  db.query("INSERT INTO item (item_name, category) VALUES (?, ?)",
    [item_name, category],
    (err) => {
      if (err) {
        console.error("Item insert error:", err);
        return res.status(500).send("DB error: " + err.message);
      }
      res.redirect("/items");
    }
  );
});

// Edit form
router.get("/items/:id/edit", (req, res) => {
  db.query("SELECT * FROM item WHERE item_id=?", [req.params.id], (err, rows) => {
    if (err) {
      console.error("Item select error:", err);
      return res.status(500).send("DB error");
    }
    if (!rows || rows.length === 0) return res.status(404).send("Item not found");
    res.render("item_edit", { item: rows[0] });
  });
});

// Update item
router.post("/items/:id/edit", (req, res) => {
  const { item_name, category } = req.body;
  db.query("UPDATE item SET item_name=?, category=? WHERE item_id=?",
    [item_name, category, req.params.id],
    (err) => {
      if (err) {
        console.error("Item update error:", err);
        return res.status(500).send("DB error: " + err.message);
      }
      res.redirect("/items");
    }
  );
});

// Delete item (pre-check)
router.post("/items/:id/delete", (req, res) => {
  const id = req.params.id;
  db.query("SELECT 1 FROM borrow_txn WHERE item_id=? LIMIT 1", [id], (err, rows) => {
    if (err) {
      console.error("Item delete check error:", err);
      return res.status(500).send("DB error");
    }
    if (rows && rows.length > 0) {
      return res.status(400).send("Cannot delete: item used in transactions.");
    }
    db.query("DELETE FROM item WHERE item_id=?", [id], (err2) => {
      if (err2) {
        console.error("Item delete error:", err2);
        return res.status(500).send("DB error");
      }
      res.redirect("/items");
    });
  });
});

// ========== BORROW TRANSACTIONS ==========

// Borrow form
router.get("/borrow", (req, res) => {
  db.query("SELECT * FROM item", (err, items) => {
    if (err) {
      console.error("Select items error:", err);
      return res.status(500).send("DB error");
    }
    db.query("SELECT * FROM person WHERE type='L'", (err2, lenders) => {
      if (err2) {
        console.error("Select lenders error:", err2);
        return res.status(500).send("DB error");
      }
      db.query("SELECT * FROM person WHERE type='B'", (err3, borrowers) => {
        if (err3) {
          console.error("Select borrowers error:", err3);
          return res.status(500).send("DB error");
        }
        res.render("borrow_form", { items, lenders, borrowers });
      });
    });
  });
});

// Insert borrow transaction (debug-friendly)
router.post("/borrow/add", (req, res) => {
  const { item_id, lender_id, borrower_id, borrow_date, due_date } = req.body;
  console.log("DEBUG /borrow/add body:", req.body);

  const sql = `INSERT INTO borrow_txn (item_id, lender_id, borrower_id, borrow_date, due_date)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [item_id, lender_id, borrower_id, borrow_date, due_date], (err, result) => {
    if (err) {
      console.error("DEBUG insert error:", err);
      return res.status(500).send("DB insert error: " + err.message);
    }
    console.log("DEBUG insert success, id:", result.insertId);
    res.redirect("/transactions");
  });
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
    if (err) {
      console.error("Transactions select error:", err);
      return res.status(500).send("DB error");
    }
    res.render("transactions", { txns });
  });
});

// Mark returned
router.post("/transactions/:id/return", (req, res) => {
  db.query("UPDATE borrow_txn SET return_date=CURDATE() WHERE txn_id=?",
    [req.params.id],
    (err) => {
      if (err) {
        console.error("Mark return error:", err);
        return res.status(500).send("DB error");
      }
      res.redirect("/transactions");
    }
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
    if (err) {
      console.error("Pending select error:", err);
      return res.status(500).send("DB error");
    }
    res.render("pending", { txns });
  });
});

module.exports = router;
