const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
console.log(`MONGO_URI: ${process.env.MONGO_URI}`); // Log the MONGO_URI for debugging
console.log(`JWT_SECRET: ${process.env.JWT_SECRET}`); // Log the JWT_SECRET for debugging



// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
