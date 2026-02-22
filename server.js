const cors = require("cors");
app.use(cors());
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = "dae7faac7ba247ce873f16a220128f4c";
const BASE_URL = "https://api.football-data.org/v4";

// 🔥 Барча жамоалар
app.get("/teams", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/PL/teams`, {
      headers: { "X-Auth-Token": API_KEY }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching teams" });
  }
});

// 🔥 Битта жамоа маълумоти
app.get("/team/:id", async (req, res) => {
  try {
    const teamId = req.params.id;

    const response = await fetch(`${BASE_URL}/teams/${teamId}`, {
      headers: { "X-Auth-Token": API_KEY }
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching team data" });
  }
});
// 🔥 Жамоанинг охирги 5 та ўйини
app.get("/team/:id/matches", async (req, res) => {
  try {
    const teamId = req.params.id;

    const response = await fetch(
      `${BASE_URL}/teams/${teamId}/matches?limit=5`,
      {
        headers: { "X-Auth-Token": API_KEY }
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
