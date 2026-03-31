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

// Search and get album routes (optional user token)
router.get("/search", async (req, res) => {
  const { q, type } = req.query;
  const userToken = req.headers["authorization"]?.replace("Bearer ", "");
  const LIMIT = 10;
  try {
    const isValidToken =
      userToken && userToken !== "null" && userToken !== "undefined";
    const token = isValidToken ? userToken : await getSpotifyToken();
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

router.get("/albums/:id", async (req, res) => {
  const { id } = req.params;
  const userToken = req.headers["authorization"]?.replace("Bearer ", "");

  try {
    const isValidToken =
      userToken && userToken !== "null" && userToken !== "undefined";
    const token = isValidToken ? userToken : await getSpotifyToken();
    // const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify API error" });
  }
});

router.get("/playlists/:id", async (req, res) => {
  const { id } = req.params;
  const userToken = req.headers["authorization"]?.replace("Bearer ", "");

  try {
    const isValidToken =
      userToken && userToken !== "null" && userToken !== "undefined";
    const token = isValidToken ? userToken : await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${id}/items?fields=items(track(album))&limit=16`, {
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

// User-specific endpoints (require user token)
router.get("/me/playlists", async (req, res) => {
  const userToken = req.headers["authorization"]?.replace("Bearer ", "");
  if (!userToken)
    return res.status(401).json({ error: "User not authenticated" });

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      {
        headers: { Authorization: `Bearer ${userToken}` },
      },
    );
    if (response.status === 429) {
      console.log(response);
      return;
    }
    const data = await response.json();
    res.json(data.items || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify API error" });
  }
});

router.put("/me/player/play", async (req, res) => {
  const userToken = req.headers["authorization"]?.replace("Bearer ", "");
  if (!userToken)
    return res.status(401).json({ error: "User not authenticated" });

  const { deviceId, id } = req.body;

  if (!deviceId || !id) {
    return res.status(400).json({
      error: "deviceId and id required",
    });
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context_uri: id }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Spotify play error:", text);
      return res
        .status(response.status)
        .json({ error: "Failed to start playback", details: text });
    }

    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Spotify API error" });
  }
});

module.exports = router;
