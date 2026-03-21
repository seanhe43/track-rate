import "../css/AlbumCard.css";
import { useMusicContext } from "../contexts/MusicContext";

function AlbumCard({ album }) {
  const { addToListened, removeFromListened, isListened } = useMusicContext();
  const listened = isListened(album.id);

  function onListenedClick(e) {
    e.preventDefault();
    if (listened) removeFromListened(album.id);
    else addToListened(album);
  }

  return (
    <div className="album-card">
      <div className="album-cover">
        <img src={album.images[1].url} alt={album.name} />
        <div className="album-overlay">
          <button
            className={`listened ${listened ? "active" : ""}`}
            onClick={onListenedClick}
          >
            🎧
          </button>
        </div>
      </div>
      <div>
        <h3>{album.name}</h3>
        <h4>{album.artists?.map((artist) => artist.name).join(", ")}</h4>
        <p>{album.release_date?.split("-")[0]}</p>
      </div>
    </div>
  );
}

export default AlbumCard;
