import { useContext } from "react";

import "./app.css";
import holochainLogo from "./assets/holochainLogo.svg";
import { ClientContext } from "./ClientContext";

import { useNavigate } from "react-router";
import { BrowserRouter, Routes, Route } from "react-router";

import SeekingPage from "./SeekingPage";

const App = () => {
  const { error, loading } = useContext(ClientContext);

  let navigate = useNavigate();

  function navtoSeeking() {
    navigate("/seeking");
  }

  function navtoHolding() {
    navigate("/holding");
  }

  return (
    <>
      <div>
        <a href="https://developer.holochain.org/get-started/" target="_blank">
          <img src={holochainLogo} className="logo holochain" alt="holochain logo" />
        </a>
      </div>
      <h1>Telefono-Casa hApp</h1>
      <div>
        <div className="card">
          {loading ? "connecting..." : (error ? error.message : "Client is connected.")}
        </div>
        <p>
          Connecting House-Holders with House-Seekers
        </p>
        <div>
          <button onClick={navtoSeeking}>
            I am an House Seeker
          </button>
          <button onClick={navtoHolding}>
            I own and House
          </button>
        </div>
        <p>Click on the selection buttons to start</p>
      </div>
    </>
  );
};

export default App;
