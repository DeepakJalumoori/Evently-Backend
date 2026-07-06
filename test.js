const mongoose = require("mongoose");
require("dotenv").config();

(async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URL);

    await mongoose.connect(process.env.MONGO_URL);

    console.log("✅ Connected successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    console.error("Cause:", err.cause);
    process.exit(1);
  }
})();
