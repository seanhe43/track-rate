import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./css/App.css";
import AlbumCard from "./components/AlbumCard";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import MyMusic from "./pages/MyMusic";
import NavBar from "./components/NavBar";

function App() {
  return (
    <div>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/MyMusic" element={<MyMusic />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
