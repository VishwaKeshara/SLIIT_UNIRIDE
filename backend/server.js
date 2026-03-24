const mongoose = require("mongoose");
require("dotenv").config();

const app = require("./app"); // make sure file name is correct (app.js)

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

//  Start Server Function
const startServer = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(MONGO_URI);
    console.log(" MongoDB Connected");

    // Start server only after DB is connected
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error(" Database connection failed:", err.message);
    process.exit(1);
  }
};

startServer();