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
      value={{ token, setToken, refreshToken, setRefreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
