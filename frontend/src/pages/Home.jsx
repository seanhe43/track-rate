import AlbumCard from "../components/AlbumCard";
import "../css/Home.css";
import { searchSpotify } from "../services/api";
import { useState, useEffect } from "react";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    if (loading) return;
    setLoading(true);
    try {
      const searchResults = await searchSpotify(searchQuery);
      setAlbums(searchResults);

      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to search...");
    } finally {
      setLoading(false);
    }
  };
  /* ---------------------------------------------------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------------------------------------------------- */
  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for music..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        ></input>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {/* page content*/}
      {(loading) ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="album-grid">
          {albums.map((album) => (
            <AlbumCard album={album} key={album.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
