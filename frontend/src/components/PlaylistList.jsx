import { useEffect, useState } from "react";
import { getUserPlaylists, playPlaylist } from "../services/spotifyApi";
import "../css/PlaylistList.css";

export default function PlaylistList({ token, player, deviceId }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!token) return;

    const fetchPlaylists = async () => {
      try {
        const data = await getUserPlaylists(token);
        setPlaylists(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylists();
  }, [token]);

  const handlePlayPlaylist = async (uri) => {
    if (!deviceId) return;

    try {
      await playPlaylist(token, deviceId, uri);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="playlist-list">
      {playlists.map((pl) => (
        <div
          key={pl.id}
          className="playlist-item"
          onClick={() => handlePlayPlaylist(pl.uri)}
        >
          <img src={pl.images[0]?.url} alt={pl.name} className="playlist-img" />
          <span className="playlist-name">{pl.name}</span>
          <button className="playlist-play-btn">▶</button>
        </div>
      ))}
    </div>
  );
}
