import { useEffect, useState } from "react";
import { useSpotifyApi } from "../services/spotifyApi";
import "../css/PlaylistList.css";
import { usePlayerContext } from "../contexts/PlayerContext";

export default function PlaylistList({ token, player, deviceId }) {
  const { getUserPlaylists } = useSpotifyApi();
  const { playlists, setPlaylists, playPlaylist } = usePlayerContext();
  
  const [playlistsLoading, setPlaylistsLoading] = useState(false);

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
    try {
      await playPlaylist(uri);
    } catch (err) {
      console.error(err);
    }
  };

  // // check if current playback context matches this playlist
  // const isActive = (playlistUri) => {
  //   console.log(playlistUri + " " + context)
  //   return (
  //     context?.startsWith("spotify:playlist:") &&
  //     context === playlistUri
  //   );
  // };

  return (
    <>
      {playlistsLoading ? (
        <div>LOADING</div>
      ) : (
        <div className="playlist-list">
          {playlists.map((pl) => {
            // const active = isActive(pl.uri);

            return (
              <div
                key={pl.id}
                className={`playlist-item`}
                onClick={() => handlePlayPlaylist(pl.uri)}
              >
                <img
                  src={pl.images[0]?.url}
                  alt={pl.name}
                  className="playlist-img"
                />
                <span className="playlist-name">{pl.name}</span>
                <button className="playlist-play-btn">▶</button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
