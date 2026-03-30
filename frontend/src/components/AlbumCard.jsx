import Rating from "@mui/material/Rating";
import "../css/AlbumCard.css";
import { useMusicContext } from "../contexts/MusicContext";

function AlbumCard({ album, onArtistClick }) {
  const {
    addToListened,
    removeFromListened,
    isListened,
    openAlbumModal,
    setRating,
    getRating,
  } = useMusicContext();
  const listened = isListened(album.id);
  const rating = getRating(album.id);

  function onListenedClick(e) {
    e.stopPropagation();
    e.preventDefault();
    if (listened) removeFromListened(album.id);
    else addToListened(album);
  }

  function handleArtistClick(artist) {
    onArtistClick(artist.name);
  }

  function onRatingChange(e, newRating) {
    e.stopPropagation();
    if (!listened) addToListened(album);
    setRating(album.id, newRating);
  }

  const ratingProperties = {
    value: rating,
    onChange: (e, newRating) => onRatingChange(e, newRating),
    onClick: (e) => e.stopPropagation(),
    precision: 0.5,
    sx : {
    color: '#e06588',
    '& .MuiRating-iconEmpty': {
      color: '#66707a',
    },
    textShadow: '0 0 6px rgba(0,0,0,0.8)',
  }
  };

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
      <div className="album-info">
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
      <div className="rating">
          <Rating {...ratingProperties} />
        </div>
    </div>
  );
}

export default AlbumCard;
