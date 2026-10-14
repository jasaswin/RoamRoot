
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`RoamRoot API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Could not start the server:", err.message);
    process.exit(1);
  }
}

startServer();
