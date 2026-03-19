import AlbumCard from "../components/AlbumCard";
import "../css/Home.css"
import { useState } from "react";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const albums = [
    { id: 1, title: "AOTY", release_date: "2025" },
    { id: 2, title: "Bops", release_date: "2023" },
    { id: 3, title: "Pop", release_date: "2020" },
    { id: 4, title: "Time Travel", release_date: "2030" },
    { id: 5, title: "Jams", release_date: "2028" },
    { id: 6, title: "AOTY", release_date: "2025" },
    { id: 7, title: "Bops", release_date: "2023" },
    { id: 8, title: "Pop", release_date: "2020" },
    { id: 9, title: "Time Travel", release_date: "2030" },
    { id: 10, title: "Jams", release_date: "2028" },
  ];

  const handleSearch = (e) => {
    e.preventDefault()
    alert(searchQuery);
  };

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
      <div className="album-grid">
        {albums.map((album) => (
          <AlbumCard album={album} key={album.id} />
        ))}
      </div>
    </div>
  );
}

export default Home;
