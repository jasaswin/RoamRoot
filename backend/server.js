require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`RoamRoot API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not start the server:", err.message);
    process.exit(1);
  });
