const Expense = require("../models/Expense");

// GET /api/expenses
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

// POST /api/expenses
const addExpense = async (req, res) => {
    const { title, amount, category } = req.body;

    if (!title || !amount || !category) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const expense = await Expense.create({
            user: req.user.id,
            title,
            amount,
            category
        });
        res.status(201).json(expense);
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ error: "Failed to create expense" });
    }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });

        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        await expense.deleteOne();
        res.status(204).end(); // No content
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ error: "Failed to delete expense" });
    }
};

// Helper function to calculate stats from expenses
const calculateStats = (expenses) => {
    // Calculate total spent
    const totalSpent = expenses
        .filter(e => e.amount < 0)
        .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        
    // Calculate savings rate (simplified calculation)
    const income = expenses
        .filter(e => e.amount > 0)
        .reduce((sum, e) => sum + e.amount, 0);
        
    const savingsRate = income > 0 
        ? Math.round(((income - totalSpent) / income) * 100)
        : 0;

    // Get top categories
    const categories = {};
    expenses.forEach(e => {
        if (e.amount < 0) {
            categories[e.category] = (categories[e.category] || 0) + Math.abs(e.amount);
        }
    });
    
    // Convert categories to array with percentages
    const categoriesArray = Object.entries(categories).map(([name, amount]) => ({
        name,
        amount: amount.toFixed(2),
        percent: totalSpent > 0 
            ? Math.round((amount / totalSpent) * 100)
            : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
        totalSpent: totalSpent.toFixed(2),
        savingsRate: Math.max(0, savingsRate), // Ensure not negative
        categories: categoriesArray.length > 0 ? categoriesArray : null
    };
};

// GET /stats
const getStats = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        const stats = calculateStats(expenses);
        res.render('stats', stats);
    } catch (error) {
        console.error("Error calculating stats:", error);
        res.status(500).render('error', { 
            message: 'Failed to load statistics',
            error: error.message 
        });
    }
};

// GET /api/expenses/stats
const getFilteredStats = async (req, res) => {
    try {
        const { period } = req.query;
        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'monthly':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'yearly':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(0); // All time
        }

        const expenses = await Expense.find({ 
            user: req.user.id,
            createdAt: { $gte: startDate }
        });

        const stats = calculateStats(expenses);
        res.json(stats);
    } catch (error) {
        console.error("Error calculating filtered stats:", error);
        res.status(500).json({ error: "Failed to load filtered statistics" });
    }
};

const resetExpenses = async (req, res) => {
    try {
        await Expense.deleteMany({ user: req.user.id });
        res.status(204).end(); // No content
    } catch (error) {
        console.error("Error resetting expenses:", error);
        res.status(500).json({ error: "Failed to reset expenses" });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    deleteExpense,
    getStats,
    getFilteredStats,
    resetExpenses
};
