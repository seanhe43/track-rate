import { useState } from "react";
import "./css/App.css";
import AlbumCard from "./components/AlbumCard";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import MyMusic from "./pages/MyMusic";
import NavBar from "./components/NavBar";
import { MusicProvider } from "./contexts/MusicContext";

function App() {
  return (
    <MusicProvider>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/MyMusic" element={<MyMusic />} />
        </Routes>
      </main>
    </MusicProvider>
  );
}

export default App;
