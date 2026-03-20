const express = require("express");
const cors = require("cors");
require("dotenv").config();


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const spotifyRoutes = require("./spotify");
app.use("/api", spotifyRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
