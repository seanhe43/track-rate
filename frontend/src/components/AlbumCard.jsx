import "../css/AlbumCard.css";
import { useMusicContext } from "../contexts/MusicContext";

function AlbumCard({ album, onArtistClick }) {
  const { addToListened, removeFromListened, isListened, openAlbumModal } = useMusicContext();
  const listened = isListened(album.id);

  function onListenedClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (listened) removeFromListened(album.id);
    else addToListened(album);
  }

  function handleArtistClick(artist) {
    onArtistClick(artist.name);
  }

  return (
    <div className="album-card">
      <div className="album-cover" onClick={() => openAlbumModal(album)}>
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
        <h4>
          {album.artists?.map((artist, index) => (
            <span
              key={artist.id}
              onClick={() => handleArtistClick(artist)} // pass artist up
            >
              {artist.name}
              {index < album.artists.length - 1 ? ", " : ""}
            </span>
          ))}
        </h4>
        <p>{album.release_date?.split("-")[0]}</p>
      </div>
    </div>
  );
}

export default AlbumCard;
