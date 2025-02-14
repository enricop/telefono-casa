import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { UserProfile } from "./types";

const CreateUserProfile: FC<CreateUserProfileProps> = ({ onUserProfileCreated }) => {
  const { client } = useContext(ClientContext);
  const [username, setUsername] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [isUserProfileValid, setIsUserProfileValid] = useState(false);

  const createUserProfile = async () => {
    const userProfileEntry: UserProfile = {
      username: username!,
      first_name: firstName ? firstName : undefined,
      last_name: lastName ? lastName : undefined,
      email_address: emailAddress!
    };
    try {
      const record = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "profile",
        fn_name: "create_user_profile",
        payload: userProfileEntry,
      });
      onUserProfileCreated && onUserProfileCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsUserProfileValid(true && username !== "" && emailAddress !== "");
  }, [username, firstName, lastName, emailAddress]);

  return (
    <div>
      <h3>Create UserProfile</h3>
      <div>
        <label htmlFor="Username">Username</label>
        <input type="text" name="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div>
        <label htmlFor="First Name">First Name</label>
        <input type="text" name="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Last Name">Last Name</label>
        <input type="text" name="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Email Address">Email Address</label>
        <input
          type="text"
          name="Email Address"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
      </div>

      <button disabled={!isUserProfileValid} onClick={() => createUserProfile()}>
        Create UserProfile
      </button>
    </div>
  );
};

interface CreateUserProfileProps {
  onUserProfileCreated?: (hash?: Uint8Array) => void;
}

export default CreateUserProfile;
