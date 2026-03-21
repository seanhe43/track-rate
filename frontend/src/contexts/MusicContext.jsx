import { createContext, useState, useContext, useEffect } from "react";

const MusicContext = createContext();

export const useMusicContext = () => useContext(MusicContext);


export const MusicProvider = ({ children }) => {
  //Listened list CRUD
  const [listened, setListened] = useState(() => {
    const storedListened = localStorage.getItem("listened");
    return storedListened ? JSON.parse(storedListened) : [];
  });

  useEffect(() => {
    localStorage.setItem("listened", JSON.stringify(listened));
  }, [listened]);

  const addToListened = (album) => {
    setListened((prev) => [...prev, album]);
  };

  const removeFromListened = (albumId) => {
    setListened((prev) => prev.filter((album) => album.id !== albumId));
  };

  const isListened = (albumId) => {
    return listened.some((album) => album.id === albumId);
  };

  //Fetch top 10 once
  // const [top10, setTop10] = useState([]);
  // const [top10Loading, setTop10Loading] = useState(false);

  // useEffect(() => {
  //   const fetchTop10 = async () => {
  //     setTop10Loading(true);
  //     try {
  //       const data = await getTopSongs();
  //       console.log("HERE")
  //       setTop10(data);
  //       console.log(JSON.stringify(data, null, 2))
  //     } catch (err) {
  //       console.log(err);
  //       setError("Failed to retrieve top 10...");
  //     } finally {
  //       setTop10Loading(false);
  //     }
  //   };
  //   fetchTop10();
  // }, []);

  const value = {
    listened,
    addToListened,
    removeFromListened,
    isListened,
    // top10,
    // top10Loading
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};
