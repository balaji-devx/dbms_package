function showErrors(form, errors) {
    let old = form.querySelector(".form-errors");
    if (old) old.remove();
  
    if (!errors || Object.keys(errors).length === 0) return;
  
    const box = document.createElement("div");
    box.className = "form-errors";
    const ul = document.createElement("ul");
  
    Object.values(errors).forEach(msg => {
      const li = document.createElement("li");
      li.textContent = msg;
      ul.appendChild(li);
    });
  
    box.appendChild(ul);
    form.prepend(box);
  }
  
  // PERSON FORM
  function validatePersonForm(e) {
    const form = e.target;
    const name = form.name.value.trim();
    const mobile = form.mobile.value.trim();
    const type = form.type.value;
  
    const errors = {};
    if (!name) errors.name = "Name required.";
    if (!mobile) errors.mobile = "Mobile required.";
    else if (!/^\d{7,15}$/.test(mobile)) errors.mobile = "Mobile must be 7–15 digits.";
    if (!type) errors.type = "Select type.";
  
    showErrors(form, errors);
    if (Object.keys(errors).length) e.preventDefault();
  }
  
  // ITEM FORM
  function validateItemForm(e) {
    const form = e.target;
    const item_name = form.item_name.value.trim();
    const category = form.category.value.trim();
  
    const errors = {};
    if (!item_name) errors.item_name = "Item name required.";
    if (!category) errors.category = "Category required.";
  
    showErrors(form, errors);
    if (Object.keys(errors).length) e.preventDefault();
  }
  
  // BORROW FORM
  function validateBorrowForm(e) {
    const form = e.target;
  
    const item = form.item_id.value;
    const lender = form.lender_id.value;
    const borrower = form.borrower_id.value;
    const borrow_date = form.borrow_date.value;
    const due_date = form.due_date.value;
  
    const errors = {};
    if (!item) errors.item = "Select item.";
    if (!lender) errors.lender = "Select lender.";
    if (!borrower) errors.borrower = "Select borrower.";
    if (lender && borrower && lender === borrower)
      errors.same = "Lender and borrower cannot be same.";
    if (!borrow_date) errors.borrow_date = "Borrow date required.";
    if (!due_date) errors.due_date = "Due date required.";
  
    if (borrow_date && due_date) {
      if (new Date(due_date) < new Date(borrow_date))
        errors.due_date = "Due date cannot be before borrow date.";
    }
  
    showErrors(form, errors);
    if (Object.keys(errors).length) e.preventDefault();
  }
  
  // Attach
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".person-form").forEach(f =>
      f.addEventListener("submit", validatePersonForm)
    );
    document.querySelectorAll(".item-form").forEach(f =>
      f.addEventListener("submit", validateItemForm)
    );
    document.querySelectorAll(".borrow-form").forEach(f =>
      f.addEventListener("submit", validateBorrowForm)
    );
  });
  