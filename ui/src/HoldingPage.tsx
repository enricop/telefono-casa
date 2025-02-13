import { useContext } from "react";

import "./app.css";
import { ClientContext } from "./ClientContext";

import CreateHouseholder from "./telefono_casa/householding/CreateHouseholder";
import AllHouseseekers from "./telefono_casa/houseseeking/AllHouseseekers";

import { NavLink } from "react-router";

const HoldingPage = () => {
  const { error, loading } = useContext(ClientContext);
  return (
    <>
      <h1>Avilable Seekers</h1>
      <div>
        <AllHouseseekers />
      </div>
      <h1>Post an house-holding announcment</h1>
      <div>
        <CreateHouseholder />
      </div>
      <NavLink to="/">Back</NavLink>
    </>
  );
};

export default HoldingPage;
