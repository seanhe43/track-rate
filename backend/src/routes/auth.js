const express = require("express");
const querystring = require("querystring");

const router = express.Router();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

router.get("/login", (req, res) => {
  const scope = [
    "user-read-private",
    "user-read-email",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
  ].join(" ");

  const query = querystring.stringify({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${query}`);
});



router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const body = querystring.stringify({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();

  const accessToken = data.access_token;

  // Redirect back to frontend with token
  res.redirect(`http://localhost:5173/callback?token=${accessToken}`);
});

module.exports = router;