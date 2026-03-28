import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PlaylistList from "./PlaylistList";
import "../css/Player.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useMusicContext } from "../contexts/MusicContext";
import { usePlayerContext } from "../contexts/PlayerContext";

function Player() {
  const { fetchWithAuth, token } = useAuth();
  const { openAlbumModal } = useMusicContext();

  const {
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
  } = usePlayerContext();

  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      const res = await fetchWithAuth("https://api.spotify.com/v1/me");
      const data = await res.json();
      setUserProfile(data);
    };

    fetchProfile();
  }, [token]);

  // CUSTOM SCROLL WHEEL VOLUME
  const handleVolumeScroll = (e) => {
    e.preventDefault();
    if (!player) return;

    const delta = e.deltaY < 0 ? 1 : -1;
    let newVolume = volume + delta * 10;

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
    token,
    player,
    deviceId,
  };

  const AlbumArtProps = {
    src: currentTrack ? currentTrack.album.images[0]?.url : null,
    alt: currentTrack ? currentTrack.name : null,
    className: "player-album-art",
    onClick: () => openAlbumModal(currentTrack.album),
  };

  const NowPlayingArtProps = {
    src: context ? context.images?.[0]?.url : null,
    alt: context ? context.name : null,
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
