import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Houseseeker } from "./types";

const CreateHouseseeker: FC<CreateHouseseekerProps> = ({ onHouseseekerCreated }) => {
  const { client } = useContext(ClientContext);
  const [location, setLocation] = useState<string>("");
  const [locationLookingfor, setLocationLookingfor] = useState<string>("");
  const [dateOfPosting, setDateOfPosting] = useState<number>(Date.now() * 1000);
  const [isHouseseekerValid, setIsHouseseekerValid] = useState(false);

  const createHouseseeker = async () => {
    const houseseekerEntry: Houseseeker = {
      location: location!,
      location_lookingfor: locationLookingfor!,
      date_of_posting: dateOfPosting!,
    };
    try {
      const record = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "houseseeking",
        fn_name: "create_houseseeker",
        payload: houseseekerEntry,
      });
      onHouseseekerCreated && onHouseseekerCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsHouseseekerValid(true && location !== "" && locationLookingfor !== "" && true);
  }, [location, locationLookingfor, dateOfPosting]);

  return (
    <div>
      <h3>Create Houseseeker</h3>
      <div>
        <label htmlFor="Location">Location</label>
        <input type="text" name="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Location Lookingfor">Location Lookingfor</label>
        <input
          type="text"
          name="Location Lookingfor"
          value={locationLookingfor}
          onChange={(e) => setLocationLookingfor(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="Date Of Posting">Date Of Posting</label>
        <input
          name="Date Of Posting"
          type="datetime-local"
          value={new Date(dateOfPosting! / 1000 - (new Date(dateOfPosting! / 1000).getTimezoneOffset() * 60000))
            .toISOString().slice(0, 16)}
          onChange={(e) => setDateOfPosting(Math.floor(new Date(e.target.value).getTime() / 1000))}
          required
        />
      </div>

      <button disabled={!isHouseseekerValid} onClick={() => createHouseseeker()}>
        Create Houseseeker
      </button>
    </div>
  );
};

interface CreateHouseseekerProps {
  onHouseseekerCreated?: (hash?: Uint8Array) => void;
}

export default CreateHouseseeker;
