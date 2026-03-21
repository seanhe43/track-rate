import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  useEffect(() => {
    // Parse token from query params
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Clean up URL (optional)
      navigate("/", { replace: true });
    } else {
      // Handle error if no token present
      console.error("No token found in URL");
    }
  }, [location.search, setToken, navigate]);

  return <div>Logging in...</div>;
}

export default Callback;
