const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./App");

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Try another port or stop the process using it.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});