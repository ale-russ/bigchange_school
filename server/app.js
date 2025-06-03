const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const studentRoutes = require("./routes/student_routes");
const classRoutes = require("./routes/classes_routes");
const ParentRoutes = require("./routes/parent_routes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/parents", ParentRoutes);

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
