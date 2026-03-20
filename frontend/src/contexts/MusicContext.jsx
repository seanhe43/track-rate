import { createContext, useState, useContext, useEffect } from "react";

const MusicContext = createContext();

export const useMusicContext = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
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

  const value = {
    listened,
    addToListened,
    removeFromListened,
    isListened,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
};
