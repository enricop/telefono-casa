import { useContext, useState } from "react";

import "./app.css";
import { ClientContext } from "./ClientContext";

import AllHouseholds from "./telefono_casa/householding/AllHouseholds";
import CreateHouseseeker from "./telefono_casa/houseseeking/CreateHouseseeker";

import { NavLink } from "react-router";

const SeekingPage = () => {
  const { error, loading } = useContext(ClientContext);
   
  return (
    <>
      <h3>Available Houses in your location</h3>
      <div>
        <AllHouseholds location={location} />
      </div>
      <h3>Post an house-seeking advert to set a specific location</h3>
      <div>
        <CreateHouseseeker />
      </div>
      <NavLink to="/">Back</NavLink>
    </>
  );
};

export default SeekingPage;
