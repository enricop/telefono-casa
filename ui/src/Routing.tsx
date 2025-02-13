import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import App from "./App";
import SeekingPage from "./SeekingPage";
import HoldingPage from "./HoldingPage";

function Routing() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={ <App />} />
          <Route path="/seeking" element={ <SeekingPage />} />
          <Route path="/holding" element={ <HoldingPage />} />
        </Routes>
    </BrowserRouter>
  );
}

export default Routing;
