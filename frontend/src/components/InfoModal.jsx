import "../css/InfoModal.css";
import { useMusicContext } from "../contexts/MusicContext";

const InfoModal = () => {
  const { infoModalOpen, closeInfoModal } = useMusicContext();
  if (!infoModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeInfoModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}></div>
    </div>
  );
};

export default InfoModal;
