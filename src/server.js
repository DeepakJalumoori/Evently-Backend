import dotenv from "dotenv";

import app from "./app.js";
import connectDB from "./config/database.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Evently app listening on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
};

startServer();
