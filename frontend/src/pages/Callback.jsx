import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setRefreshToken } = useAuth();

  useEffect(() => {
    // Parse token from query params
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    const refreshToken = params.get("refresh_token");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setRefreshToken(refreshToken);

      // clean up url
      navigate("/", { replace: true });
    } else {
      console.error("No token found in URL");
    }
  }, [location.search, setToken, navigate]);

  return <div>Logging in...</div>;
}

export default Callback;
