import { useContext, useEffect, useState, useCallback } from "react";

import "./app.css";
import holochainLogo from "./assets/holochainLogo.svg";
import { ClientContext } from "./ClientContext";

import { HolochainError, Link, SignalCb, SignalType } from "@holochain/client";

import { useNavigate } from "react-router";

import CreateUserProfile from "./telefono_casa/profile/CreateUserProfile";
import UserProfileDetail from "./telefono_casa/profile/UserProfileDetail";
import { ProfileSignal } from "./telefono_casa/profile/types";

const App = () => {

  const { error, loading, client } = useContext(ClientContext);

  const [userHasProfile, setUserHasProfile] = useState(false);
  const [userHash, setUserHash] = useState<Uint8Array>(new Uint8Array);
  const [userLoading, setUserLoading] = useState(false);

  let navigate = useNavigate();

  function navtoSeeking() {
    navigate("/seeking");
  }

  function navtoHolding() {
    navigate("/holding");
  }

  function onUserProfileCreation(hash?: Uint8Array) {
    setUserHasProfile(false);

    if (!hash) {
      console.log("invalid user create hash");
      return;
    }

    setUserHash(hash);
  }

  const fetchUserProfile = useCallback(async () => {
    setUserLoading(true);
    try {
      const agent_create_action_hash = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "profile",
        fn_name: "get_original_user_profile_for_agent",
        payload: client.myPubKey,
      });

      if (!agent_create_action_hash) {
          console.log("agent_create_action_hash is not valid");
          setUserHasProfile(false);
          setUserLoading(false);
          return;
      }

      const latest_user_profile = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "profile",
        fn_name: "get_latest_user_profile",
        payload: agent_create_action_hash,
      });

      if (!latest_user_profile) {
        console.log("latest_user_profile is not valid");
        setUserHasProfile(false);
        setUserLoading(false);
        return;
      }

      setUserHasProfile(true);
      setUserLoading(false);
    } catch (e) {
      console.log(e);
    } finally {
      setUserLoading(false);
    }
  }, [userHash]);

  /*
  const creationSignal: SignalCb = useCallback((signal) => {
    if (!(SignalType.App in signal)) return;
    if (signal.App.zome_name !== "houseseeking") return;
    const payload = signal.App.payload as ProfileSignal;
    if (payload.type !== "EntryCreated") return;
    if (payload.app_entry.type !== "UserProfile") return;
    setHashes((prevHashes) => [...prevHashes, payload.action.hashed.hash]);
  }, [setHashes]);
  */

  useEffect(() => {
    fetchUserProfile();
    //client?.on("signal", creationSignal);
  }, [client, fetchUserProfile]);

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
        <h3>
          Connecting House-Holders with House-Seekers
        </h3>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <button onClick={navtoSeeking}>
            I am an House Seeker
          </button>
          <button onClick={navtoHolding}>
            I own and House
          </button>
        </div>
        <p>Click on the above selection buttons to start</p>
        <div>
        {
          !userHasProfile ? 
                              (
                                userLoading ? 
                                
                                (
                                  <progress />
                                )
                                :
                                (
                                <div>  
                                <h3>User profile does not exist. Creation required:</h3>
                                <CreateUserProfile
                                  onUserProfileCreated={onUserProfileCreation} 
                                  />
                                </div>
                                )

                              )
                                :
                              (
                                <div>  
                                <h3>User profile created:</h3>
                                  <UserProfileDetail 
                                    userProfileHash={userHash}
                                  />
                                </div>
                              )
        }
        </div>
        <div>
          
        </div>
      </div>
    </>
  );
};

export default App;
