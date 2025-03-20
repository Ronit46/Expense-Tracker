const Expense = require("../models/Expense");

const getExpenses = async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id });
    res.json(expenses);
};

const addExpense = async (req, res) => {
    const { title, amount, category } = req.body;
    const expense = await Expense.create({ user: req.user.id, title, amount, category });
    res.json(expense);
};

const deleteExpense = async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted" });
};

module.exports = { getExpenses, addExpense, deleteExpense };
