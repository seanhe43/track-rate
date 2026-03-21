import { Link } from "react-router-dom";
import "../css/NavBar.css";
import { useAuth } from "../contexts/AuthContext";

function NavBar() {
  const { token, setToken } = useAuth();

   const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/login";
  };

  const handleLogout = () => {
    
    setToken(null)
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Soundtracker</Link>
      </div>
      <div className="navbar-links">
        {!token ? (
          <button onClick={handleLogin} className="nav-link">
            Log In
          </button>
        ) : (
          <button onClick={handleLogout} className="nav-link">
            Logout
          </button>
        )}
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
