const express = require("express");
const cors = require("cors");
require("dotenv").config();

const spotifyRoutes = require("./spotify");
const authRoutes = require("./routes/auth.js");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());


app.use("/api", spotifyRoutes)
app.use("/auth", authRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
