import { useContext } from "react";

import "./app.css";
import { ClientContext } from "./ClientContext";

import AllHouseholds from "./telefono_casa/householding/AllHouseholds";


const SeekingPage = () => {
  const { error, loading } = useContext(ClientContext);
  return (
    <>
      <h1>Avilable Houses</h1>
      <div>
        <AllHouseholds />
      </div>
      <h1>Post an house-seeking announcment</h1>
      <div>

      </div>
    </>
  );
};

export default SeekingPage;
