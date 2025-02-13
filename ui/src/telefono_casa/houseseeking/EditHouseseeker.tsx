import { HolochainError, Record } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Houseseeker } from "./types";

const EditHouseseeker: FC<EditHouseseekerProps> = ({
  originalHouseseekerHash,
  currentRecord,
  currentHouseseeker,
  onHouseseekerUpdated,
  onHouseseekerUpdateError,
  onEditCanceled,
}) => {
  const { client } = useContext(ClientContext);
  const [location, setLocation] = useState<string | undefined>(currentHouseseeker?.location);
  const [locationLookingfor, setLocationLookingfor] = useState<string | undefined>(
    currentHouseseeker?.location_lookingfor,
  );
  const [dateOfPosting, setDateOfPosting] = useState<number | undefined>(currentHouseseeker?.date_of_posting);
  const [isHouseseekerValid, setIsHouseseekerValid] = useState(false);

  const updateHouseseeker = useCallback(async () => {
    const houseseeker: Partial<Houseseeker> = {
      location: location,
      location_lookingfor: locationLookingfor,
      date_of_posting: dateOfPosting,
    };
    try {
      const updateRecord = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "houseseeking",
        fn_name: "update_houseseeker",
        payload: {
          original_houseseeker_hash: originalHouseseekerHash,
          previous_houseseeker_hash: currentRecord?.signed_action.hashed.hash,
          updated_houseseeker: houseseeker,
        },
      });
      onHouseseekerUpdated(updateRecord.signed_action.hashed.hash);
    } catch (e) {
      onHouseseekerUpdateError && onHouseseekerUpdateError(e as HolochainError);
    }
  }, [
    client,
    currentRecord,
    onHouseseekerUpdated,
    onHouseseekerUpdateError,
    originalHouseseekerHash,
    location,
    locationLookingfor,
    dateOfPosting,
  ]);

  useEffect(() => {
    if (!currentRecord) {
      throw new Error(`The currentRecord prop is required`);
    }
    if (!originalHouseseekerHash) {
      throw new Error(`The originalHouseseekerHash prop is required`);
    }
  }, [currentRecord, originalHouseseekerHash]);

  useEffect(() => {
    setIsHouseseekerValid(true && location !== "" && locationLookingfor !== "" && true);
  }, [location, locationLookingfor, dateOfPosting]);

  return (
    <section>
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

      <div>
        <button onClick={onEditCanceled}>Cancel</button>
        <button onClick={updateHouseseeker} disabled={!isHouseseekerValid}>Edit Houseseeker</button>
      </div>
    </section>
  );
};

interface EditHouseseekerProps {
  originalHouseseekerHash: Uint8Array;
  currentRecord: Record | undefined;
  currentHouseseeker: Houseseeker | undefined;
  onHouseseekerUpdated: (hash?: Uint8Array) => void;
  onEditCanceled: () => void;
  onHouseseekerUpdateError?: (error: HolochainError) => void;
}

export default EditHouseseeker;
