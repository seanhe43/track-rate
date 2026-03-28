import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpotifyApi } from "../services/spotifyApi";

const PlayerContext = createContext();

export const usePlayerContext = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const { fetchWithAuth, token } = useAuth();
  const { getAlbum } = useSpotifyApi();

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(20);
  const [isShuffled, setIsShuffled] = useState(false);

  const [contextUri, setContextUri] = useState(null);
  const [context, setContext] = useState(null);

const [playlists, setPlaylists] = useState([]); // user playlists
  const [albumCache, setAlbumCache] = useState({}); // cache albums from active session for hud

  const fetchCurrentPlayback = async () => {
    if (!token) return;

    try {
      const res = await fetchWithAuth("https://api.spotify.com/v1/me/player");
      if (res.status === 204 || !res.ok) return;

      const data = await res.json();

      setIsPaused(!data.is_playing);
      setVolume(data.device.volume_percent);
      setContextUri(data.context?.uri);
      setIsShuffled(data.shuffle_state);
    } catch (err) {
      console.error("Failed to fetch playback:", err);
    }
  };

  const transferPlayback = async () => {
    try {
      await fetchWithAuth("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false,
        }),
      });
    } catch (err) {
      console.error("Failed to transfer playback:", err);
    }
  };

  const playAlbum = async (id) => {
    if (!player) return;
    player.connect();
    try {
      const res = await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/play`,
        {
          method: "PUT",
          body: JSON.stringify({ context_uri: id }),
        },
      );
    } catch (err) {
      console.error("Play Album failed: ", err);
    }
  };

  const togglePlay = async () => {
    // await fetchCurrentPlayback();
    if (!player) return;
    player.connect();

    await player.togglePlay();
  };

  const toggleShuffle = async () => {
    if (!player) return;

    try {
      await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/shuffle?state=${!isShuffled}&device_id=${deviceId}`,
        { method: "PUT" },
      );

      setIsShuffled((prev) => !prev);
    } catch (err) {
      console.error("Shuffle failed:", err);
    }
  };

  const seekTo = async (value) => {
    if (!player) return;
    await player.seek(value);
  };

  useEffect(() => {
    const getFullData = async () => {
      fetchCurrentPlayback();
      if (!contextUri) return;
      const [, contextType, contextId] = contextUri.split(":");

      if (contextType === "album") {
        if (!albumCache[contextId]) {
          const fullData = await getAlbum(contextId);
          setAlbumCache((prev) => ({ ...prev, [contextId]: fullData }));
        }
        setContext(albumCache[contextId]);
      } else if (contextType === "playlist") {
        setContext(playlists.find((playlist) => playlist.id === contextId));
      } else {
        setContext(null);
      }
    };
    getFullData();
  }, [currentTrack]);

  // --- INIT PLAYER ---

  useEffect(() => {
    if (!token) {
      setPlayer(null);
      setDeviceId(null);
      setCurrentTrack(null);
      setNextTrack(null);
      return;
    }

    const loadPlayer = () => {
      const player = new window.Spotify.Player({
        name: "Soundtracker Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.2,
      });

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        player.setVolume(volume ? volume/100 : 0.2);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) return;

        setCurrentTrack(state.track_window.current_track);
        setNextTrack(state.track_window.next_tracks[0]);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);

        if (typeof state.volume === "number") {
          setVolume(state.volume * 100);
        }
      });

      player.connect();
      setPlayer(player);
    };

    if (window.Spotify) {
      // SDK is already loaded
      loadPlayer();
    } else {
      // Load SDK dynamically
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = loadPlayer;
    }

    fetchCurrentPlayback();
  }, [token]);

  useEffect(() => {
    if (token && deviceId) {
      transferPlayback();
    }
  }, [token, deviceId]);

  // position ticking
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = prev + 1000;
        return next > duration ? duration : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, duration]);



  const value = {
    player,
    deviceId,
    currentTrack,
    nextTrack,
    isPaused,
    position,
    duration,
    volume,
    setVolume,
    isShuffled,
    context,
    togglePlay,
    toggleShuffle,
    seekTo,
    setPosition,
    playAlbum,
    playlists,
    setPlaylists
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
