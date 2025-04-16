const express = require("express");
const protect = require("../config/authMiddleware");
const { 
    getExpenses, 
    addExpense, 
    deleteExpense,
    getStats,
    getFilteredStats,
    resetExpenses
} = require("../controllers/expenseController");

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, addExpense);
router.delete("/reset", protect, resetExpenses);
router.delete("/:id", protect, deleteExpense);
router.get("/stats", protect, getStats);
router.get("/stats/filter", protect, getFilteredStats);

module.exports = router;
