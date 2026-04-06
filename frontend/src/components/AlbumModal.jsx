import { useState, useEffect } from "react";
import { useMusicContext } from "../contexts/MusicContext";
import { usePlayerContext } from "../contexts/PlayerContext";
import Rating from "@mui/material/Rating";
import "../css/AlbumModal.css";

const AlbumModal = () => {
  const {
    selectedAlbum,
    closeAlbumModal,
    modalLoading,
    isListened,
    getNote,
    updateNote,
    addToListened,
    removeFromListened,
    extendedAlbum,
    getRating,
    setRating
  } = useMusicContext();

  const { playAlbum } = usePlayerContext();

  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedAlbum) {
      setNote(getNote(selectedAlbum.id) || "");
    }
  }, [selectedAlbum]);

  if (!selectedAlbum) return null;

  function onListenedClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (isListened(extendedAlbum.id)) removeFromListened(extendedAlbum.id);
    else addToListened(extendedAlbum);
  }

  const displayAlbum = selectedAlbum
    ? { ...selectedAlbum, ...(extendedAlbum || {}) }
    : null;

  function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const handlePlayAlbum = async (uri) => {
    try {
      await playAlbum(uri);
    } catch (err) {
      console.error(err);
    }
  };
  function onRatingChange(e, newRating) {
    e.stopPropagation();
    if (!isListened(selectedAlbum.id)) addToListened(selectedAlbum);
    setRating(selectedAlbum.id, newRating);
  }

  const ratingProperties = {
    value: getRating(selectedAlbum.id) || 0,
    onChange: (e, newRating) => onRatingChange(e, newRating),
    onClick: (e) => e.stopPropagation(),
    precision: 0.5,
    sx: {
      color: "#e06588",
      "& .MuiRating-iconEmpty": {
        color: "#66707a",
      },
      textShadow: "0 0 6px rgba(0,0,0,0.8)",
    },
  };

  return (
    <>
      {modalLoading ? (
        <div className="modal-overlay" onClick={closeAlbumModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            Loading...
          </div>
        </div>
      ) : (
        <div className="modal-overlay" onClick={closeAlbumModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="album-modal">
              <div className="modal-left">
                <div className="album-art-wrapper">
                  <img
                    src={displayAlbum.images[0].url}
                    alt={displayAlbum.name}
                  />
                  <button
                    className={`listened ${isListened(displayAlbum.id) ? "active" : ""}`}
                    onClick={onListenedClick}
                  >
                    🎧
                  </button>
                </div>

                <h2 className="album-name">{displayAlbum.name}</h2>
                <p className="album-artists">
                  {displayAlbum.artists
                    ?.map((artist) => artist.name)
                    .join(", ")}
                </p>
                <p className="album-year">{displayAlbum.release_date}</p>
                <div className="modal-rating">
                  <Rating {...ratingProperties} />
                </div>
                <button
                  className="play-button"
                  onClick={() => handlePlayAlbum(displayAlbum.uri)}
                >
                  ▶
                </button>

                {isListened(displayAlbum.id) && (
                  <div className="album-notes">
                    <textarea
                      placeholder="Add your notes..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onBlur={() => updateNote(displayAlbum.id, note)}
                    />
                  </div>
                )}
                
              </div>

              <ul className="track-list">
                {displayAlbum.tracks?.items.map((track, i) => (
                  <li key={i} className="track-row">
                    <span className="track-number">{i + 1}</span>
                    <span className="track-name">{track.name}</span>
                    <span className="track-duration">
                      {formatMs(track.duration_ms)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumModal;
