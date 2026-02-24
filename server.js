const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

// 🔐 API калитингни шу ерга қўй
const API_KEY = "dae7faac7ba247ce873f16a220128f4c";
const BASE_URL = "https://api.football-data.org/v4";


// 🔥 Барча жамоалар
app.get("/teams", async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/competitions/PL/teams`, {
      headers: { "X-Auth-Token": API_KEY },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Жамоаларни олишда хатолик" });
  }
});


// 🔥 Битта жамоа маълумоти
app.get("/team/:id", async (req, res) => {
  try {
    const teamId = req.params.id;

    const response = await fetch(`${BASE_URL}/teams/${teamId}`, {
      headers: { "X-Auth-Token": API_KEY },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Жамоа маълумотида хатолик" });
  }
});


// 🔥 Жамоанинг охирги 10 та ўйини
app.get("/team/:id/matches", async (req, res) => {
  try {
    const teamId = req.params.id;

    const response = await fetch(
      `${BASE_URL}/teams/${teamId}/matches?status=FINISHED&limit=10`,
      { headers: { "X-Auth-Token": API_KEY } }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Ўйинлар маълумотида хатолик" });
  }
});


// 🔥🔥🔥 AI PROFESSIONAL ANALYZE
app.get("/analyze/:homeId/:awayId", async (req, res) => {
  try {
    const { homeId, awayId } = req.params;

    const homeResponse = await fetch(
      `${BASE_URL}/teams/${homeId}/matches?status=FINISHED&limit=10`,
      { headers: { "X-Auth-Token": API_KEY } }
    );

    const awayResponse = await fetch(
      `${BASE_URL}/teams/${awayId}/matches?status=FINISHED&limit=10`,
      { headers: { "X-Auth-Token": API_KEY } }
    );

    const homeData = await homeResponse.json();
    const awayData = await awayResponse.json();

    // 📊 Гол урган ва ўтказган ҳисоблаш
    const homeStats = homeData.matches.reduce(
      (acc, match) => {
        const isHome = match.homeTeam.id == homeId;

        const scored = isHome
          ? match.score.fullTime.home
          : match.score.fullTime.away;

        const conceded = isHome
          ? match.score.fullTime.away
          : match.score.fullTime.home;

        acc.scored += scored || 0;
        acc.conceded += conceded || 0;

        return acc;
      },
      { scored: 0, conceded: 0 }
    );

    const awayStats = awayData.matches.reduce(
      (acc, match) => {
        const isHome = match.homeTeam.id == awayId;

        const scored = isHome
          ? match.score.fullTime.home
          : match.score.fullTime.away;

        const conceded = isHome
          ? match.score.fullTime.away
          : match.score.fullTime.home;

        acc.scored += scored || 0;
        acc.conceded += conceded || 0;

        return acc;
      },
      { scored: 0, conceded: 0 }
    );

    const avgHomeScored = homeStats.scored / homeData.matches.length;
    const avgHomeConceded = homeStats.conceded / homeData.matches.length;

    const avgAwayScored = awayStats.scored / awayData.matches.length;
    const avgAwayConceded = awayStats.conceded / awayData.matches.length;

    // ⚔️ Ҳужум кучи
    const homePower = (avgHomeScored + avgAwayConceded) / 2;
    const awayPower = (avgAwayScored + avgHomeConceded) / 2;

    const totalGoals = homePower + awayPower;
    const diff = homePower - awayPower;

    // 🏆 1X2 натижа
    let winner;
    if (diff > 0.6) winner = "Home Win";
    else if (diff < -0.6) winner = "Away Win";
    else winner = "Draw";

    // ⚽ Тотал
    const over25 = totalGoals > 2.5 ? "Over 2.5" : "Under 2.5";
    const over15 = totalGoals > 1.5 ? "Over 1.5" : "Under 1.5";

    // 🎯 Иккала жамоа гол урадими?
    const btts = homePower > 0.8 && awayPower > 0.8 ? "YES" : "NO";

    // 📉 Фора
    let handicap;
    if (diff > 1) handicap = "Home -1";
    else if (diff > 0.5) handicap = "Home -0.5";
    else if (diff < -1) handicap = "Away -1";
    else if (diff < -0.5) handicap = "Away -0.5";
    else handicap = "Фора аниқ эмас";

    // 🔢 Тахминий аниқ ҳисоб
    const exactScore = `${Math.round(homePower)}-${Math.round(awayPower)}`;

    // 📊 Ишонч фоизи
    const confidence = Math.min(
      85,
      Math.abs(diff) * 40 + totalGoals * 10
    ).toFixed(0);

    res.json({
      homePower: homePower.toFixed(2),
      awayPower: awayPower.toFixed(2),
      totalGoals: totalGoals.toFixed(2),

      winner,
      over25,
      over15,
      btts,
      handicap,
      exactScore,
      confidence: confidence + "%"
    });

  } catch (error) {
    res.status(500).json({ error: "AI таҳлил хатоси" });
  }
});


// 🚀 Сервер ишга тушириш
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} портда ишлаяпти`);
});
