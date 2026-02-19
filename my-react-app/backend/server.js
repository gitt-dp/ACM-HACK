const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/centers", async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 5000,
          keyword: "government office",
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );

    res.json(response.data.results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch centers" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
