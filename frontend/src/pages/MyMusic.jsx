import "../css/MyMusic.css";
import { useMusicContext } from "../contexts/MusicContext";
import AlbumCard from "../components/AlbumCard";

function MyMusic() {
  const { listened } = useMusicContext();

  if (listened && listened.length > 0) {
    return (
      <div className="my-album-list">
        <h2>My Albums</h2>
        <div className="album-grid">
          {listened.map((album) => (
            <AlbumCard album={album} key={album.id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-music-empty">
      <h2>No Albums Yet...</h2>
      <p>Start adding albums and they will appear here</p>
    </div>
  );
}

export default MyMusic;
