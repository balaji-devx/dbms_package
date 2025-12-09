const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",  // change if you have a username
  password: "",  // add password if you set one
  database: "borrow_db"
});

connection.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully!");
  }
});

module.exports = connection;
