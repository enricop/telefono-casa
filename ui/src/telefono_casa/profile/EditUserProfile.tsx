import { HolochainError, Record } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { UserProfile } from "./types";

const EditUserProfile: FC<EditUserProfileProps> = ({
  originalUserProfileHash,
  currentRecord,
  currentUserProfile,
  onUserProfileUpdated,
  onUserProfileUpdateError,
  onEditCanceled,
}) => {
  const { client } = useContext(ClientContext);
  const [username, setUsername] = useState<string | undefined>(currentUserProfile?.username);
  const [firstName, setFirstName] = useState<string | undefined>(currentUserProfile?.first_name);
  const [lastName, setLastName] = useState<string | undefined>(currentUserProfile?.last_name);
  const [emailAddress, setEmailAddress] = useState<string | undefined>(currentUserProfile?.email_address);
  const [isUserProfileValid, setIsUserProfileValid] = useState(false);

  const updateUserProfile = useCallback(async () => {
    const userProfile: Partial<UserProfile> = {
      username: username,
      first_name: firstName,
      last_name: lastName,
      email_address: emailAddress,
      password: currentUserProfile?.password,
    };
    try {
      const updateRecord = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "profile",
        fn_name: "update_user_profile",
        payload: {
          original_user_profile_hash: originalUserProfileHash,
          previous_user_profile_hash: currentRecord?.signed_action.hashed.hash,
          updated_user_profile: userProfile,
        },
      });
      onUserProfileUpdated(updateRecord.signed_action.hashed.hash);
    } catch (e) {
      onUserProfileUpdateError && onUserProfileUpdateError(e as HolochainError);
    }
  }, [
    client,
    currentRecord,
    onUserProfileUpdated,
    onUserProfileUpdateError,
    originalUserProfileHash,
    username,
    firstName,
    lastName,
    emailAddress,
    currentUserProfile?.password,
  ]);

  useEffect(() => {
    if (!currentRecord) {
      throw new Error(`The currentRecord prop is required`);
    }
    if (!originalUserProfileHash) {
      throw new Error(`The originalUserProfileHash prop is required`);
    }
  }, [currentRecord, originalUserProfileHash]);

  useEffect(() => {
    setIsUserProfileValid(true && username !== "" && emailAddress !== "");
  }, [username, firstName, lastName, emailAddress]);

  return (
    <section>
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

      <div>
        <button onClick={onEditCanceled}>Cancel</button>
        <button onClick={updateUserProfile} disabled={!isUserProfileValid}>Edit UserProfile</button>
      </div>
    </section>
  );
};

interface EditUserProfileProps {
  originalUserProfileHash: Uint8Array;
  currentRecord: Record | undefined;
  currentUserProfile: UserProfile | undefined;
  onUserProfileUpdated: (hash?: Uint8Array) => void;
  onEditCanceled: () => void;
  onUserProfileUpdateError?: (error: HolochainError) => void;
}

export default EditUserProfile;
