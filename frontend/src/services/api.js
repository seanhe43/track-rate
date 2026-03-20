const BASE_URL = "http://localhost:5000/api";

export const searchSpotify = async (query, type = "album") => {
  const response = await fetch(
    `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }

  const data = await response.json();

  return data.albums.items;
};

export const getTopSongs = async () => {
  const response = await fetch(`${BASE_URL}/api/playlist/top-albums`);
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
    // fix
};
