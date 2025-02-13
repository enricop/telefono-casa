import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Householder, HouseStatus } from "./types";

const CreateHouseholder: FC<CreateHouseholderProps> = ({ onHouseholderCreated }) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [membersSize, setMembersSize] = useState<number>(0);
  const [houseStatus, setHouseStatus] = useState<HouseStatus>({ type: "Ready" });
  const [timeOfPosting, setTimeOfPosting] = useState<number>(Date.now() * 1000);
  const [isHouseholderValid, setIsHouseholderValid] = useState(false);

  const createHouseholder = async () => {
    const householderEntry: Householder = {
      title: title!,
      location: location!,
      members_size: membersSize!,
      house_status: houseStatus!,
      time_of_posting: timeOfPosting!,
    };
    try {
      const record = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "householding",
        fn_name: "create_householder",
        payload: householderEntry,
      });
      onHouseholderCreated && onHouseholderCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsHouseholderValid(true && title !== "" && true && true && true);
  }, [title, membersSize, houseStatus, timeOfPosting]);

  return (
    <div>
      <h3>Create Householder</h3>
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

      <button disabled={!isHouseholderValid} onClick={() => createHouseholder()}>
        Create Householder
      </button>
    </div>
  );
};

interface CreateHouseholderProps {
  onHouseholderCreated?: (hash?: Uint8Array) => void;
}

export default CreateHouseholder;
