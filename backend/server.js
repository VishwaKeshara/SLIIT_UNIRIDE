const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app"); // import app.js

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    const server = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );

    // Handle server errors
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Try another port or stop the process using it.`
        );
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();