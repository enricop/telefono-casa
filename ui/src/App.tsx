import { useContext } from "react";

import "./app.css";
import holochainLogo from "./assets/holochainLogo.svg";
import { ClientContext } from "./ClientContext";

const App = () => {
  const { error, loading } = useContext(ClientContext);
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
          <button>
            I am an House Seeker
          </button>
          <button>
            I own and House
          </button>
        </div>
        <>Click on the selection buttons to start</>
      </div>
    </>
  );
};

export default App;
