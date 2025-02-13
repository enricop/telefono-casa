import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import Routing from "./Routing.tsx";

import ClientProvider from "./ClientContext.tsx";
import SeekingPage from "./SeekingPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClientProvider>
      <Routing />
    </ClientProvider>
  </React.StrictMode>,
);
