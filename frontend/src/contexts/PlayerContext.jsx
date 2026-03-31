import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSpotifyApi } from "../services/spotifyApi";
const PlayerContext = createContext();
export const usePlayerContext = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const { fetchWithAuth, token, refreshAccessToken } = useAuth();
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
  const [context, setContext] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [albumCache, setAlbumCache] = useState({});

  // refs for player sdk : ensure singleton player, keep player alive
  const playerRef = useRef(null);
  const hasInitialized = useRef(false);
  const playerReady = useRef(null); // resolves with deviceId when player is ready

  const getDevices = async () => {
    if (!token) return;
    try {
      const res = await fetchWithAuth(
        "https://api.spotify.com/v1/me/player/devices",
      );
      const data = await res.json();
      // console.log(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    }
  };

  const transferPlayback = async (id) => {
    // only if necessary
    if (!id) return;
    const devices = await getDevices();
    const activeDevice = devices.devices.find((device) => device.id === id);
    if (!activeDevice || !activeDevice.is_active) {
      try {
        const res = await fetchWithAuth(
          "https://api.spotify.com/v1/me/player",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ device_ids: [id], play: false }),
          },
        );
        if (res.status === 404) return;
      } catch (err) {
        console.error("Failed to transfer playback:", err);
      }
    }
  };

  const ensurePlayer = async () => {
    if (!playerReady.current) throw new Error("Player not initialized yet");
    const readyDeviceId = playerReady.current;

    const devices = await getDevices();
    const activeDevice = devices.devices.find(
      (device) => device.name === "soundTracker Player",
    );
    // console.log(activeDevice);

    if (activeDevice && activeDevice.id !== readyDeviceId) {
      setDeviceId(activeDevice.id);
      return activeDevice.id;
    }

    return readyDeviceId;
  };

  const playAlbum = async (id) => {
    const currDevice = await ensurePlayer();
    if (!player) return;

    try {
      await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/play?device_id=${currDevice}`,
        { method: "PUT", body: JSON.stringify({ context_uri: id }) },
      );
    } catch (err) {
      console.error("Play Album failed: ", err);
    }
  };

  const playPlaylist = async (id) => {
    const currDevice = await ensurePlayer();
    if (!player) return;

    try {
      await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/play?device_id=${currDevice}`,
        { method: "PUT", body: JSON.stringify({ context_uri: id }) },
      );
    } catch (err) {
      console.error("Play Playlist failed: ", err);
    }
  };

  const togglePlay = async () => {
    const currDevice = await ensurePlayer();
    // console.log(deviceId)
    if (!player) return;

    const playOrPause = isPaused ? "play" : "pause";

    try {
      await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/${playOrPause}?device_id=${currDevice}`,
        { method: "PUT" },
      );
    } catch (err) {
      console.error("Play failed: ", err);
    }
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

  // context & next up hud
  useEffect(() => {
    const updateNowPlayingHud = async () => {
      if (!player) return;
      const state = await player.getCurrentState();
      if (!state) return;

      setNextTrack(state.track_window.next_tracks[0]);
      setCurrentTrack(state.track_window.current_track);
      const contextUri = state.context?.uri;
      if (!contextUri) return;

      const [, contextType, contextId] = contextUri.split(":");
      if (contextType === "album") {
        if (!albumCache[contextId]) {
          const fullData = await getAlbum(contextId);
          setAlbumCache((prev) => ({ ...prev, [contextId]: fullData }));
          setContext(fullData);
        } else {
          setContext(albumCache[contextId]);
        }
      } else if (contextType === "playlist") {
        setContext(playlists.find((p) => p.id === contextId));
      } else {
        setContext(null);
      }
    };

    if (player) updateNowPlayingHud();
  }, [currentTrack, isShuffled]);

  // initialize player
  // initialize player
  useEffect(() => {
    if (!token) {
      setPlayer(null);
      setDeviceId(null);
      setCurrentTrack(null);
      setNextTrack(null);
      return;
    }

    const loadPlayer = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      const playerInstance = new window.Spotify.Player({
        name: "soundTracker Player",
        getOAuthToken: (cb) => {
          refreshAccessToken()
            .then((newToken) => cb(newToken))
            .catch((err) => console.error("Failed to refresh token", err));
        },
        volume: 0.2,
      });

      playerRef.current = playerInstance;

      playerReady.current = new Promise((resolve) => {
        playerInstance.addListener("ready", async ({ device_id }) => {
          setDeviceId(device_id);
          playerInstance.setVolume(volume ? volume / 100 : 0.2);
          resolve(device_id);
        });
      });

      // reduce frequent re-renders by batching state updates
      playerInstance.addListener("player_state_changed", (state) => {
        if (!state) return;
        setCurrentTrack((prev) =>
          prev?.id !== state.track_window.current_track.id
            ? state.track_window.current_track
            : prev,
        );
        setNextTrack(state.track_window.next_tracks[0] || null);
        setIsPaused(state.paused);
        setPosition(state.position);
        setDuration(state.duration);
        if (typeof state.volume === "number") setVolume(state.volume * 100);
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };

    if (window.Spotify) {
      loadPlayer();
    } else if (!document.getElementById("spotify-sdk")) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = loadPlayer; // call once SDK loads
      document.body.appendChild(script);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
      hasInitialized.current = false;
    };
  }, [token]);

  // update seekbar
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPosition((prev) => Math.min(prev + 1000, duration));
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
    setPlaylists,
    playPlaylist,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
};
