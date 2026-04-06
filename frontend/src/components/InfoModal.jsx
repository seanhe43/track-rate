import { useState } from "react";
import "../css/InfoModal.css";
import { useMusicContext } from "../contexts/MusicContext";
import AlbumCard from "./AlbumCard";

const InfoModal = () => {
  const { infoModalOpen, closeInfoModal } = useMusicContext();
  const [listened, setListened] = useState(false);
  const [rating, setRating] = useState(0);

  if (!infoModalOpen) return null;
  const sampleAlbum = {name: "Album Name", artists : [{name: "Artist Name",}], images: [{}, {url: "../../sample_album.png"}]};

  const sampleProps = {
    album: sampleAlbum,
    onArtistClick: () => {},
    override: {
      isListened: () => listened,
      getRating: () => rating,
      addToListened: () => setListened(true),
      removeFromListened: () => setListened(false),
      setRating: (_, r) => {
        if (!listened) setListened(true);
        setRating(r);
      },
      openAlbumModal: () => {},
    },
  };

  return (
    <div className="info-modal-overlay" onClick={closeInfoModal}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>soundTracker</h2>
        <div className="divider" />
        <p>Rate your favorite music!</p>
        <p>Keep track of every album you've listened to! </p>
        <p>
          Search music and artists, listen with Spotify, and rate each album on
          a five-star scale.
        </p>
        <p>Write reviews or notes on your thoughts of each album.</p>
        <AlbumCard {...sampleProps} />
        <div className="divider" />
        <p>Log in with Spotify to listen as you rate!</p>
        <div className="divider" />
        <a href="https://github.com/seanhe43">github</a>
      </div>
    </div>
  );
};

export default InfoModal;
