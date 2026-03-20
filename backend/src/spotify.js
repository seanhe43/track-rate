const express = require("express");

const router = express.Router();

let accessToken = null;
let tokenExpires = 0;

// Get Spotify app token
async function getSpotifyToken() {
  const now = Date.now();

  if (accessToken && now < tokenExpires) {
    return accessToken;
  }

  const authString = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  accessToken = data.access_token;
  tokenExpires = now + data.expires_in * 1000;

  return accessToken;
}

// Search route
router.get("/search", async (req, res) => {
  const { q, type } = req.query;
  const LIMIT = 10

  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=${LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify API error" });
  }
});

const PLAYLIST_ID  = "37i9dQZEVXbMDoHDwVN2tF"; // Top 50 world playlist
// get top 10 albums from top 10 songs from top 50 world playlist




module.exports = router;
