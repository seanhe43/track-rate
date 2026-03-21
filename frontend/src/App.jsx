import { useState } from "react";
import "./css/App.css";
import AlbumCard from "./components/AlbumCard";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import MyMusic from "./pages/MyMusic";
import NavBar from "./components/NavBar";
import { MusicProvider } from "./contexts/MusicContext";
import { AuthProvider } from "./contexts/AuthContext";
import Callback from "./pages/Callback"
import Player from "./components/Player"

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <NavBar />
        <div className="app-layout">
          <Player />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/MyMusic" element={<MyMusic />} />
              <Route path="/callback" element={<Callback />} />
            </Routes>
          </main>
        </div>
      </MusicProvider>
    </AuthProvider>
  );
}
export default App;
