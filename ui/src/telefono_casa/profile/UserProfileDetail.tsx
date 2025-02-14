import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import EditUserProfile from "./EditUserProfile";
import type { UserProfile } from "./types";

const UserProfileDetail: FC<UserProfileDetailProps> = ({ userProfileHash }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "profile",
        fn_name: "get_latest_user_profile",
        payload: userProfileHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, userProfileHash]);

  useEffect(() => {
    if (!userProfileHash) {
      throw new Error(`The userProfileHash prop is required for this component`);
    }
    fetchUserProfile();
  }, [fetchUserProfile, userProfileHash]);

  useEffect(() => {
    if (!record) return;
    setUserProfile(decode((record.entry as any).Present.entry) as UserProfile);
  }, [record]);

  if (loading) {
    return <progress />;
  }

  if (error) {
    return <div className="alert">Error: {error.message}</div>;
  }

  return (
    <div>
      {editing
        ? (
          <div>
            <EditUserProfile
              originalUserProfileHash={userProfileHash}
              currentRecord={record}
              currentUserProfile={userProfile}
              onUserProfileUpdated={async () => {
                setEditing(false);
                await fetchUserProfile();
              }}
              onEditCanceled={() => setEditing(false)}
            />
          </div>
        )
        : record
        ? (
          <section>
            <div>
              <span>
                <strong>Username:</strong>
              </span>
              <span>{userProfile?.username}</span>
            </div>
            <div>
              <span>
                <strong>First Name:</strong>
              </span>
              <span>{userProfile?.first_name}</span>
            </div>
            <div>
              <span>
                <strong>Last Name:</strong>
              </span>
              <span>{userProfile?.last_name}</span>
            </div>
            <div>
              <span>
                <strong>Email Address:</strong>
              </span>
              <span>{userProfile?.email_address}</span>
            </div>
            <div>
              <button onClick={() => setEditing(true)}>edit</button>
            </div>
          </section>
        )
        : <div className="alert">The requested userProfile was not found.</div>}
    </div>
  );
};

interface UserProfileDetailProps {
  userProfileHash: Uint8Array;
}

export default UserProfileDetail;
