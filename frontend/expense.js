document.getElementById("expenseForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, amount, category }),
    });

    const data = await response.json();
    if (data) {
        alert("Expense Added!");
        location.reload();
    }
});

const fetchExpenses = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
    });

    const expenses = await response.json();
    document.getElementById("expenseList").innerHTML = expenses
        .map(exp => `<li>${exp.title} - $${exp.amount} (${exp.category})</li>`)
        .join("");
};

fetchExpenses();
