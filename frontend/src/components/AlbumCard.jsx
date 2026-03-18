import "../css/AlbumCard.css"

function AlbumCard({ album }) {
  function onListenedClick() {
    alert("clicked");
  }

  return (
    <div className="album-card">
      <div className="album-cover">
        <img src={album.url} alt={album.title} />
        <div className="album-overlay">
          <button className="listened" onClick={onListenedClick}>
            🎧
          </button>
        </div>
      </div>
      <div>
        <h3>{album.title}</h3>
        <p>{album.release_date}</p>
      </div>
    </div>
  );
}

export default AlbumCard;
