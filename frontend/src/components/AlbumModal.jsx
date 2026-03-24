import { useContext, useState, useEffect } from "react";
import { useMusicContext } from "../contexts/MusicContext";
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
    removeFromListened
  } = useMusicContext();

  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedAlbum && isListened(selectedAlbum)) {
      setNote(getNote(selectedAlbum.id) || "");
    }
  }, [selectedAlbum]);
  if (!selectedAlbum) return null;

  function onListenedClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (isListened(selectedAlbum.id)) removeFromListened(selectedAlbum.id);
    else addToListened(selectedAlbum);
  }

  return (
    <>
      {modalLoading ? (
        <div>Loading</div>
      ) : (
        <div className="modal-overlay" onClick={closeAlbumModal}>
          <div
            className="modal-content album-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="album-art-wrapper">
              <img src={selectedAlbum.images[0].url} alt={selectedAlbum.name} />
              <button
                className={`listened ${isListened(selectedAlbum.id) ? "active" : ""}`}
                onClick={onListenedClick}
              >
                🎧
              </button>
            </div>

            <h2>{selectedAlbum.name}</h2>
            <h3>
              {selectedAlbum.artists?.map((artist) => artist.name).join(", ")}
            </h3>
            <h4>{isListened(selectedAlbum.id) && "🎧 Listened"}</h4>
            {isListened(selectedAlbum.id) && (
              <div className="album-notes">
                <textarea
                  placeholder="Add your notes..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={() => updateNote(selectedAlbum.id, note)}
                />
              </div>
            )}

            <ul>
              {selectedAlbum.tracks?.map((track, i) => (
                <li key={i}>{track.name}</li>
              ))}
            </ul>

            <button
              onClick={() => {
                /* hook into player */
              }}
            >
              Play Album
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumModal;
