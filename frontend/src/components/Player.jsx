import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PlaylistList from "./PlaylistList";
import "../css/Player.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useMusicContext } from "../contexts/MusicContext";

function Player() {
  const { fetchWithAuth, token } = useAuth();
  const { addToListened, removeFromListened, isListened, openAlbumModal } =
    useMusicContext();

  const [deviceId, setDeviceId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  // const [context, setContext] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Reset player if user logs out
  useEffect(() => {
    if (!token) {
      setUserProfile(null);
      setPlayer(null);
      setDeviceId(null);
      setCurrentTrack(null);
      setIsPaused(true);
      return;
    }

    // Fetch user's profile
    const fetchProfile = async () => {
      try {
        const res = await fetchWithAuth("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();

    // Initialize Spotify Web Playback SDK
    window.onSpotifyWebPlaybackSDKReady = () => {
      const playerInstance = new window.Spotify.Player({
        name: "Soundtracker Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.2,
      });

      playerInstance.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        playerInstance.getVolume().then((v) => setVolume(v * 100));
      });

      playerInstance.addListener("player_state_changed", (state) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);

        setPosition(state.position);
        setDuration(state.duration);
        // setContext(state.context?.uri || null);
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };
  }, [token]);

  // FETCH CURRENT PLAYBACK STATE IN CASE THERE IS AN ACTIVE SONG (not so useful yet (until context switching implemented))
  useEffect(() => {
    if (!token) return;

    const fetchCurrentPlayback = async () => {
      try {
        const res = await fetchWithAuth(
          "https://api.spotify.com/v1/me/player",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.status === 204) return;
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;

        // Update current track + paused state
        setCurrentTrack(data.item);
        setIsPaused(!data.is_playing);
        // setIsShuffled(data.shuffle_state);
        setVolume(data.device.volume_percent);
      } catch (err) {
        console.error("Failed to fetch current playback:", err);
      }
    };

    fetchCurrentPlayback();
  }, []);

  // seekbar updating
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

  // seek
  const seekTo = async (value) => {
    if (!token) return;

    try {
      await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${value}&device_id=${deviceId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setPosition(value);
    } catch (err) {
      console.error("Seek failed:", err);
    }
  };

  // PLAYER CONTROLS
  const togglePlay = async () => {
    if (!player) return;
    await player.togglePlay();
  };

  // SHUFFLE
  //   const [isShuffled, setIsShuffled] = useState(false);
  //   const toggleShuffle = async () => {
  //     if (!player) return;

  //     try {
  //       await player.setShuffle(!isShuffled);
  //       setIsShuffled((prev) => !prev);
  //     } catch (err) {
  //       console.error("Failed to toggle shuffle:", err);
  //     }
  //   };

  useEffect(() => {
    if (!player) return;

    const listener = (state) => {
      if (!state) return;
      // setIsShuffled(state.shuffle);

      if (typeof state.volume === "number") {
        setVolume(state.volume * 100); // player.volume is 0-1, we keep 0-100
      }
    };

    player.addListener("player_state_changed", listener);

    return () => {
      player.removeListener("player_state_changed", listener);
    };
  }, [player]);

  //CUSTOM SCROLL WHEEL VOLUME SLIDER FUNCTIONALITY
  const handleVolumeScroll = (e) => {
    e.preventDefault();

    if (!player) return;

    const delta = e.deltaY < 0 ? 1 : -1; // scroll up -> increase, scroll down -> decrease
    let newVolume = volume + delta * 10;

    // Clamp volume between 0 and 100
    newVolume = Math.max(0, Math.min(100, newVolume));

    setVolume(newVolume);
    player.setVolume(newVolume / 100);
  };

  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // VOLUME SLIDER USING RC SLIDER
  const [volume, setVolume] = useState(20);
  const volumeSliderProps = {
    min: 0,
    max: 100,
    value: volume,
    onChange: (val) => {
      setVolume(val);
      if (player) player.setVolume(val / 100);
    },
    className: "volume-slider",
  };

  const progressSliderProps = {
    min: 0,
    max: duration || 1,
    value: position,
    onChange: (val) => setPosition(val),
    onChangeComplete: seekTo,
    className: "progress-slider",
  };

  const PlaylistListProps = {
    token: token,
    player: player,
    deviceId: deviceId,
    // activePlayerUri: context,
  };

  const AlbumArtProps = {
    src: currentTrack ? currentTrack.album.images[0]?.url : null,
    alt: currentTrack ? currentTrack.name : null,
    className: "player-album-art",
    onClick: () => openAlbumModal(currentTrack.album),
  };

  return (
    <div className="player-sidebar">
      {/* Player controls section */}
      <div className="player-top">
        {currentTrack ? (
          <>
            <img {...AlbumArtProps} />
            <div className="player-info">
              <h4 className="player-track">{currentTrack.name}</h4>
              <p className="player-artist">
                {currentTrack.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <div className="player-progress">
              <div className="player-time">
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <Slider {...progressSliderProps} />
            </div>

            <div className="player-controls">
              {/* <button onClick={toggleShuffle}>
                  {isShuffled ? "🔀 On" : "🔀 Off"}
                </button> */}

              <button onClick={() => player?.previousTrack()}>⏮</button>

              <button onClick={togglePlay}>{isPaused ? "▶" : "⏸"}</button>

              <button onClick={() => player?.nextTrack()}>⏭</button>

              <div className="player-volume" onWheel={handleVolumeScroll}>
                <Slider {...volumeSliderProps} />
              </div>
              <p className="volume-display">{`${volume}%`}</p>
            </div>
          </>
        ) : (
          <p className="no-track">No track playing</p>
        )}
      </div>

      {/* Spacer grows to push bottom sections down */}
      <div className="player-spacer"></div>

      {token && (
        <div className="player-playlists">
          <PlaylistList {...PlaylistListProps} />
        </div>
      )}

      {userProfile && (
        <div className="player-profile">
          {userProfile.images?.[0] && (
            <img src={userProfile.images[0].url} alt="Profile" />
          )}
          <span className="player-username">{userProfile.display_name}</span>
        </div>
      )}
    </div>
  );
}

export default Player;
