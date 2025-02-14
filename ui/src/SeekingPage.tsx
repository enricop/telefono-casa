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
      <h3>Avilable Houses in your location</h3>
      <div>
        <AllHouseholds />
      </div>
      <h3>Post an house-seeking announcement to set your location</h3>
      <div>
        <CreateHouseseeker />
      </div>
      <NavLink to="/">Back</NavLink>
    </>
  );
};

export default SeekingPage;
