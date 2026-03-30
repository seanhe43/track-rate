import "../css/MyMusic.css";
import { useMusicContext } from "../contexts/MusicContext";
import AlbumCard from "../components/AlbumCard";
import { useState, useMemo } from "react";

function MyMusic() {
  const { listened } = useMusicContext();

  const [sortType, setSortType] = useState("recency"); // "recency" | "rating"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"
  const [searchQuery, setsearchQuery] = useState("");

  const displayedAlbums = useMemo(() => {
    if (!listened) return [];

    const filtered = listened.filter((album) => {
      const term = searchQuery.toLowerCase();
      const nameMatch = album.name.toLowerCase().includes(term);
      const artistMatch = album.artists.some((artist) =>
        artist.name.toLowerCase().includes(term),
      );
      return nameMatch || artistMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortType === "recency") {
        const aIndex = listened.indexOf(a);
        const bIndex = listened.indexOf(b);
        return sortOrder === "desc" ? bIndex - aIndex : aIndex - bIndex;
      } else if (sortType === "rating") {
        const aScore = a.rating;
        const bScore = b.rating;

        if (aScore == null && bScore == null) return 0;

        if (aScore == null) return 1;
        if (bScore == null) return -1;

        return sortOrder === "desc" ? bScore - aScore : aScore - bScore;
      }

      return 0;
    });

    return sorted;
  }, [listened, sortType, sortOrder, searchQuery]);

  const searchProps = {
    type: "text",
    placeholder: "Search albums or artists...",
    value: searchQuery,
    onChange: (e) => setsearchQuery(e.target.value),
    className: "search-input"
  };

  return (
    <div className="my-music">
      {listened.length > 0 ? (
        <div className="my-album-list">
          <h2>My Albums</h2>
          <div className="my-music-controls">
            <input {...searchProps} />

            <div className="sort-controls">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="recency">Recency</option>
                <option value="rating">Rating</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
          <div className="album-grid">
            {displayedAlbums.map((album) => (
              <AlbumCard
                album={album}
                key={album.id}
                onArtistClick={setsearchQuery}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="my-music-empty">
          <h2>No Albums Yet...</h2>
          <p>Start adding albums and they will appear here</p>
        </div>
      )}
    </div>
  );
}

export default MyMusic;
