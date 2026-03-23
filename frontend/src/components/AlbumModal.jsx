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
  } = useMusicContext();

  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedAlbum && isListened(selectedAlbum)) {
      setNote(getNote(selectedAlbum.id) || "");
    }
  }, [selectedAlbum]);
  if (!selectedAlbum) return null;

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
            <img src={selectedAlbum.images[1].url} alt={selectedAlbum.name} />

            <h2>{selectedAlbum.name}</h2>
            <h3>
              {selectedAlbum.artists?.map((artist) => artist.name).join(", ")}
            </h3>
            <h4>{isListened(selectedAlbum.id) && "🎧"}</h4>
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
