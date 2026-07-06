require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");

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
