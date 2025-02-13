import { HolochainError, Record } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Householder, HouseStatus } from "./types";

const EditHouseholder: FC<EditHouseholderProps> = ({
  originalHouseholderHash,
  currentRecord,
  currentHouseholder,
  onHouseholderUpdated,
  onHouseholderUpdateError,
  onEditCanceled,
}) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string | undefined>(currentHouseholder?.title);
  const [location, setLocation] = useState<string | undefined>(currentHouseholder?.location);
  const [membersSize, setMembersSize] = useState<number | undefined>(currentHouseholder?.members_size);
  const [houseStatus, setHouseStatus] = useState<HouseStatus | undefined>(currentHouseholder?.house_status);
  const [timeOfPosting, setTimeOfPosting] = useState<number | undefined>(currentHouseholder?.time_of_posting);
  const [isHouseholderValid, setIsHouseholderValid] = useState(false);

  const updateHouseholder = useCallback(async () => {
    const householder: Partial<Householder> = {
      title: title,
      location: location,
      members_size: membersSize,
      house_status: houseStatus,
      time_of_posting: timeOfPosting,
    };
    try {
      const updateRecord = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "householding",
        fn_name: "update_householder",
        payload: {
          original_householder_hash: originalHouseholderHash,
          previous_householder_hash: currentRecord?.signed_action.hashed.hash,
          updated_householder: householder,
        },
      });
      onHouseholderUpdated(updateRecord.signed_action.hashed.hash);
    } catch (e) {
      onHouseholderUpdateError && onHouseholderUpdateError(e as HolochainError);
    }
  }, [
    client,
    currentRecord,
    onHouseholderUpdated,
    onHouseholderUpdateError,
    originalHouseholderHash,
    title,
    membersSize,
    houseStatus,
    timeOfPosting,
  ]);

  useEffect(() => {
    if (!currentRecord) {
      throw new Error(`The currentRecord prop is required`);
    }
    if (!originalHouseholderHash) {
      throw new Error(`The originalHouseholderHash prop is required`);
    }
  }, [currentRecord, originalHouseholderHash]);

  useEffect(() => {
    setIsHouseholderValid(true && title !== "" && true && true && true);
  }, [title, membersSize, houseStatus, timeOfPosting]);

  return (
    <section>
      <div>
        <label htmlFor="Title">Title</label>
        <input type="text" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Location">Location (Dot Separated)</label>
        <input type="text" name="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Members Size">Members Size</label>
        <input
          type="number"
          name="Members Size"
          value={membersSize}
          onChange={e => setMembersSize(parseInt(e.target.value))}
          min="0"
          max="255"
        />
      </div>

      <div>
        <label htmlFor="House Status">House Status:</label>
        <select
          name="House Status"
          defaultValue={houseStatus?.type}
          onChange={(e) => setHouseStatus({ type: e.target.value as any })}
        >
          <option value="Ready">Ready</option>
          <option value="NeedsSomeWork">Needs Some Work</option>
          <option value="NeedsToBeBuilt">Needs To Be Built</option>
        </select>
      </div>

      <div>
        <label htmlFor="Time Of Posting">Time Of Posting</label>
        <input
          name="Time Of Posting"
          type="datetime-local"
          value={new Date(timeOfPosting! / 1000 - (new Date(timeOfPosting! / 1000).getTimezoneOffset() * 60000))
            .toISOString().slice(0, 16)}
          onChange={(e) => setTimeOfPosting(Math.floor(new Date(e.target.value).getTime() / 1000))}
          required
        />
      </div>

      <div>
        <button onClick={onEditCanceled}>Cancel</button>
        <button onClick={updateHouseholder} disabled={!isHouseholderValid}>Edit Householder</button>
      </div>
    </section>
  );
};

interface EditHouseholderProps {
  originalHouseholderHash: Uint8Array;
  currentRecord: Record | undefined;
  currentHouseholder: Householder | undefined;
  onHouseholderUpdated: (hash?: Uint8Array) => void;
  onEditCanceled: () => void;
  onHouseholderUpdateError?: (error: HolochainError) => void;
}

export default EditHouseholder;
