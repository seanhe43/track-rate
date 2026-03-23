import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("spotify_token") || null,
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("spotify_refresh_token") || null,
  );

  const refreshAccessToken = async () => {
    // console.log("REFRESHING ACCESS TOKEN: ", refreshToken);
    if (!refreshToken) return;

    try {
      const res = await fetch(
        `http://localhost:5000/auth/refresh?refresh_token=${refreshToken}`,
      );

      const data = await res.json();

      if (!data.access_token) throw new Error("No access token returned");

      setToken(data.access_token);
      return data.access_token;
    } catch (err) {
      console.error("Refresh failed", err);
      setToken(null);
      setRefreshToken(null);
      return null;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      const newToken = await refreshAccessToken();

      if (!newToken) return res;

      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return res;
  };

  useEffect(() => {
    if (refreshToken) {
      refreshAccessToken();
    }
  }, []);

  // sync tokens to localStorage
  useEffect(() => {
    if (token) localStorage.setItem("spotify_token", token);
    else localStorage.removeItem("spotify_token");

    if (refreshToken)
      localStorage.setItem("spotify_refresh_token", refreshToken);
    else localStorage.removeItem("spotify_refresh_token");
  }, [token, refreshToken]);

  return (
    <AuthContext.Provider
      value={{ token, setToken, refreshToken, setRefreshToken, fetchWithAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
