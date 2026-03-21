
const SPOTIFY_BASE = "https://api.spotify.com/v1";


export const getUserPlaylists = async (token) => {
  const res = await fetch(`${SPOTIFY_BASE}/me/playlists?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch playlists");
  }

  const data = await res.json();
  return data.items || [];
};


export const playPlaylist = async (token, deviceId, uri) => {
  const res = await fetch(
    `${SPOTIFY_BASE}/me/player/play?device_id=${deviceId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context_uri: uri }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to start playlist");
  }
};

// export const getRecentlyPlayed = async (token) => {
//   const res = await fetch(
//     "https://api.spotify.com/v1/me/player/recently-played",
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   return res.json();
// };

// export const getUserPlaylists = async (token) => {
//   const res = await fetch("https://api.spotify.com/v1/me/playlists", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return res.json();
// };
