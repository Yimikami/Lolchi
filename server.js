const express = require("express");
const axios = require("axios");
const cors = require("cors");
const env = require("dotenv").config().parsed;

const app = express();
const port = 3001; // You can change this port if needed

const RIOT_API_KEY = env.RIOT_API_KEY;

app.use(cors());

app.get("/api/account/:platform/:name/:tagline", async (req, res) => {
  const { platform, name, tagline } = req.params;

  try {
    const response = await axios.get(
      `https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tagline}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});

app.get("/api/summoner/:region/:puuid", async (req, res) => {
  const { region, puuid } = req.params;

  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});
app.get("/api/ranked/:region/:summonerId", async (req, res) => {
  const { region, summonerId } = req.params;

  try {
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});

app.get("/api/matches/:platform/:puuid", async (req, res) => {
  const { puuid, platform } = req.params;
  const { start = 0, count = 20 } = req.query;
  try {
    const response = await axios.get(
      `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      {
        params: { start, count },
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});

app.get("/api/match/:platform/:matchId", async (req, res) => {
  const { matchId, platform } = req.params;

  try {
    const response = await axios.get(
      `https://${platform}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      {
        headers: {
          "X-Riot-Token": RIOT_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});

app.get(
  "/api/spectator/active-games/by-summoner/:region/:puuid",
  async (req, res) => {
    const { region, puuid } = req.params;

    try {
      const response = await axios.get(
        `https://${region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}`,
        {
          headers: {
            "X-Riot-Token": RIOT_API_KEY,
          },
        }
      );

      res.json(response.data);
    } catch (error) {
      res
        .status(error.response ? error.response.status : 500)
        .json(error.response ? error.response.data : { error: error.message });
    }
  }
);

app.get("/api/champion/:championId", async (req, res) => {
  const { championId } = req.params;
  try {
    const url = `https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/champion.json`;
    const response = await axios.get(url);
    const champions = response.data.data;
    for (const champion of Object.values(champions)) {
      if (champion.key == championId.toString()) {
        res.json({ name: champion.id });
        return;
      }
    }
    res.status(404).json({ error: "Champion not found" });
  } catch (error) {
    res
      .status(error.response ? error.response.status : 500)
      .json(error.response ? error.response.data : { error: error.message });
  }
});

app.listen(port, () => {
  console.log(RIOT_API_KEY);
  console.log(`Proxy server running at http://localhost:${port}`);
});
