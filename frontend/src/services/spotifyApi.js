import { useAuth } from "../contexts/AuthContext";

const BASE_URL = "http://localhost:5000/api";

export const useSpotifyApi = () => {
  const { fetchWithAuth, token } = useAuth();

  const searchSpotify = async (query, type = "album") => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetchWithAuth(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`,
      {
        headers,
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch search results");
    }

    const data = await res.json();
    return data.albums?.items || [];
  };

  const getAlbum = async (id) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // console.log(`${BASE_URL}/albums/${id}`);

    const res = await fetchWithAuth(`${BASE_URL}/albums/${id}`, { headers });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to fetch album");
    }

    return res.json();
  };



  // User-specific endpoints
  const getUserPlaylists = async () => {
    const res = await fetchWithAuth(`${BASE_URL}/me/playlists`);

    if (!res.ok) {
      throw new Error("Failed to fetch playlists");
    }

    const data = await res.json();
    return data || [];
  };

  // const playPlaylist = async (deviceId, id) => {
  //   const res = await fetchWithAuth(`${BASE_URL}/me/player/play`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ deviceId, id }),
  //   });

  //   if (!res.ok) {
  //     throw new Error("Failed to start playlist");
  //   }
  // };


  // const transferPlayback = async (deviceId) => {
  //   try {
  //     await fetchWithAuth(`${BASE_URL}/me/player`, {
  //       method: "PUT",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         device_ids: [deviceId],
  //         play: false,
  //       }),
  //     });
  //   } catch (err) {
  //     console.error("Failed to transfer playback:", err);
  //   }
  // };

  return {
    searchSpotify,
    getUserPlaylists,
    getAlbum,
    // transferPlayback,
  };
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
