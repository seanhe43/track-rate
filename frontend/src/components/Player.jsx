import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PlaylistList from "./PlaylistList";
import "../css/Player.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useMusicContext } from "../contexts/MusicContext";
import { useSpotifyApi } from "../services/spotifyApi";

function Player() {
  const { fetchWithAuth, token } = useAuth();
  const {
    openAlbumModal,
    deviceId,
    setDeviceId,
    albumDetailsCache,
    setAlbumDetailsCache,
    playlists,
  } = useMusicContext();
  const { getAlbum } = useSpotifyApi();

  const [player, setPlayer] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [contextUri, setContextUri] = useState(null);
  const [context, setContext] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);

  const fetchCurrentPlayback = async () => {
    if (!token) return;
    try {
      const res = await fetchWithAuth("https://api.spotify.com/v1/me/player", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) return;
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      setIsPaused(!data.is_playing);
      setVolume(data.device.volume_percent);
      setContextUri(data.context.uri);
      setIsShuffled(data.shuffle_state);
    } catch (err) {
      console.error("Failed to fetch current playback:", err);
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

  useEffect(() => {
    if (!token) {
      setUserProfile(null);
      setPlayer(null);
      setDeviceId(null);
      setCurrentTrack(null);
      setIsPaused(true);
      return;
    }

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

    fetchCurrentPlayback();

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
        setNextTrack(state.track_window.next_tracks[0]);
        setIsPaused(state.paused);

        setPosition(state.position);
        setDuration(state.duration);
      });

      playerInstance.connect();
      setPlayer(playerInstance);
    };
  }, [token]);

  useEffect(() => {
    if (!token || !deviceId) return;

    transferPlayback();
  }, [token, deviceId]);

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
    if (!deviceId) transferPlayback();
    if (!player) return;
    await player.togglePlay();
  };

  // SHUFFLE

  const toggleShuffle = async () => {
    if (!player) return;

    try {
      const response = await fetchWithAuth(
        `https://api.spotify.com/v1/me/player/shuffle?state=${!isShuffled}&device_id=${deviceId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIsShuffled((prev) => !prev);
    } catch (err) {
      console.error("Toggle Shuffle Failed", err);
    }
  };

  useEffect(() => {
    if (!player) return;

    const listener = (state) => {
      if (!state) return;

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

  // context display
  useEffect(() => {
    const getFullData = async () => {
      fetchCurrentPlayback();
      if (!contextUri) return;
      const [, contextType, contextId] = contextUri.split(":");

      if (contextType === "album") {
        if (!albumDetailsCache[contextId]) {
          const fullData = await getAlbum(contextId);
          setAlbumDetailsCache((prev) => ({ ...prev, [contextId]: fullData }));
        }
        setContext(albumDetailsCache[contextId]);
      } else if (contextType === "playlist") {
        setContext(playlists.find((playlist) => playlist.id === contextId));
      } else {
        setContext(null);
      }
    };
    getFullData();
  }, [currentTrack]);

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
  };

  const AlbumArtProps = {
    src: currentTrack ? currentTrack.album.images[0]?.url : null,
    alt: currentTrack ? currentTrack.name : null,
    className: "player-album-art",
    onClick: () => openAlbumModal(currentTrack.album),
  };

  const NowPlayingArtProps = {
    src: context ? context.images[0]?.url : null,
    alt: context ? context.name?.url : null,
    className: "now-playing-art",
  };

  const noSongMessage = token
    ? "No track playing"
    : "Log in to play from Spotify";

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
              <button
                className={isShuffled ? "shuffle-on" : "shuffle-off"}
                onClick={toggleShuffle}
              />

              <button
                className="prev"
                onClick={() => player?.previousTrack()}
              />

              <button
                className={isPaused ? "play" : "pause"}
                onClick={togglePlay}
              />

              <button className="next" onClick={() => player?.nextTrack()} />

              <div className="player-volume" onWheel={handleVolumeScroll}>
                <Slider {...volumeSliderProps} />
              </div>
              <p className="volume-display">{`${volume}%`}</p>
            </div>
            {context !== null && (
              <div className="context-hud">
                <div className="now-playing">
                  <div className="crop-image">
                    <img {...NowPlayingArtProps} />
                  </div>
                  <span className="now-playing-name">{context?.name}</span>
                </div>
                <div className="up-next">
                  {nextTrack !== null && (
                    <div className="up-next-text">
                      Up next: {nextTrack?.name}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="no-track">{noSongMessage}</p>
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
