import { createContext, useState, useContext, useEffect } from "react";
import { useSpotifyApi } from "../services/spotifyApi";

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
    setListened((prev) => [...prev, { ...album, note: "" }]);
  };

  const removeFromListened = (albumId) => {
    setListened((prev) => prev.filter((album) => album.id !== albumId));
  };

  const isListened = (albumId) => {
    return listened.some((album) => album.id === albumId);
  };

  const getNote = (albumId) => {
    return listened.find((album) => album.id === albumId)?.note || "";
  };

  const updateNote = (albumId, note) => {
    setListened((prev) =>
      prev.map((album) => (album.id === albumId ? { ...album, note } : album)),
    );
  };

  const { getAlbum } = useSpotifyApi();
  // Album Modal
  const [selectedAlbum, setSelectedAlbum] = useState(null); // basic info
  const [extendedAlbum, setExtendedAlbum] = useState(null); // full info from API
  const [albumDetailsCache, setAlbumDetailsCache] = useState({});
  const [modalLoading, setModalLoading] = useState(false);


  const getIdFromBase = (album) => {
    return album.uri.split(":")[2];
  };

  const openAlbumModal = (album) => {
    setSelectedAlbum(album);
    extendModal();
  };

  const closeAlbumModal = () => {
    setSelectedAlbum(null);
    setExtendedAlbum(null);
  };

  const extendModal = async () => {
    if (!selectedAlbum || !selectedAlbum.uri) return;

    const albumId = getIdFromBase(selectedAlbum);
    if (albumDetailsCache[albumId]) {
      setExtendedAlbum(albumDetailsCache[albumId]);
      return;
    }

    setModalLoading(true);
    try {
      const fullData = await getAlbum(albumId);
      setAlbumDetailsCache((prev) => ({ ...prev, [albumId]: fullData }));
      setExtendedAlbum(fullData);
    } catch (err) {
      console.error("Failed to fetch album details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // when album selected for modal, get extended info
  useEffect(() => {
    if (!selectedAlbum) return;
    extendModal();
  }, [selectedAlbum]);

  // info modal
  const [infoModalOpen, setInfoModalOpen] = useState(true);

  const openInfoModal = () => {
    setInfoModalOpen(true);
  };

  const closeInfoModal = () => {
    setInfoModalOpen(false);
  };



  const [deviceId, setDeviceId] = useState(null);

  const value = {
    listened,
    addToListened,
    removeFromListened,
    isListened,
    // top10,
    // top10Loading
    openAlbumModal,
    closeAlbumModal,
    selectedAlbum,
    modalLoading,
    updateNote,
    getNote,
    extendedAlbum,
    deviceId,
    setDeviceId,
    albumDetailsCache,
    setAlbumDetailsCache,
    infoModalOpen,
    closeInfoModal,
    openInfoModal
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
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
