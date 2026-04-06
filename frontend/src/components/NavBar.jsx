import { Link } from "react-router-dom";
import "../css/NavBar.css";
import { useAuth } from "../contexts/AuthContext";
import { useMusicContext } from "../contexts/MusicContext";

function NavBar() {
  const { token, setToken, setRefreshToken } = useAuth();
  const { openInfoModal } = useMusicContext();

  const handleLogin = () => {
    const backendUrl = import.meta.env.VITE_REACT_APP_API_URL;
    window.location.href = `${backendUrl}/auth/login`;
  };

  const handleLogout = () => {
    setToken(null);
    setRefreshToken(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">soundTracker</Link>
      </div>
      <div className="navbar-links">
        <button onClick={openInfoModal} className="info-button" />
        <div className="log-in-out">
          {!token ? (
            <button onClick={handleLogin}>Log In</button>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>

        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/MyMusic" className="nav-link">
          My Music
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
