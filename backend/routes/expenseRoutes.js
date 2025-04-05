const express = require("express");
const protect = require("../config/authMiddleware");

const { getExpenses, addExpense, deleteExpense } = require("../controllers/expenseController");

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, addExpense);
router.delete("/:id", protect, deleteExpense);

module.exports = router;
