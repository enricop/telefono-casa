import { useContext } from "react";

import "./app.css";
import { ClientContext } from "./ClientContext";

import CreateHouseholder from "./telefono_casa/householding/CreateHouseholder";
import AllHouseseekers from "./telefono_casa/houseseeking/AllHouseseekers";

import { NavLink } from "react-router";

const HoldingPage = () => {
  return (
    <>
      <h3>Available House Seekers in your location</h3>
      <div>
        <AllHouseseekers />
      </div>
      <h3>Post an house-owner advert</h3>
      <div>
        <CreateHouseholder />
      </div>
      <NavLink to="/">Back</NavLink>
    </>
  );
};

export default HoldingPage;
