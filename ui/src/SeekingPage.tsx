import { useContext } from "react";

import "./app.css";
import { ClientContext } from "./ClientContext";

import AllHouseholds from "./telefono_casa/householding/AllHouseholds";
import CreateHouseseeker from "./telefono_casa/houseseeking/CreateHouseseeker";

import { NavLink } from "react-router";

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
        <CreateHouseseeker />
      </div>
      <NavLink to="/">Back</NavLink>
    </>
  );
};

export default SeekingPage;
