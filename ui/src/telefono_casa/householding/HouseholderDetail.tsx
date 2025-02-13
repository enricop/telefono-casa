import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import EditHouseholder from "./EditHouseholder";
import type { Householder, HouseStatus } from "./types";

const HouseholderDetail: FC<HouseholderDetailProps> = ({ householderHash, onHouseholderDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [householder, setHouseholder] = useState<Householder | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchHouseholder = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "householding",
        fn_name: "get_latest_householder",
        payload: householderHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, householderHash]);

  const deleteHouseholder = async () => {
    setLoading(true);
    try {
      await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "householding",
        fn_name: "delete_householder",
        payload: householderHash,
      });
      onHouseholderDeleted && onHouseholderDeleted(householderHash);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!householderHash) {
      throw new Error(`The householderHash prop is required for this component`);
    }
    fetchHouseholder();
  }, [fetchHouseholder, householderHash]);

  useEffect(() => {
    if (!record) return;
    setHouseholder(decode((record.entry as any).Present.entry) as Householder);
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
            <EditHouseholder
              originalHouseholderHash={householderHash}
              currentRecord={record}
              currentHouseholder={householder}
              onHouseholderUpdated={async () => {
                setEditing(false);
                await fetchHouseholder();
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
                <strong>Title:</strong>
              </span>
              <span>{householder?.title}</span>
            </div>
            <div>
              <span>
                <strong>Location:</strong>
              </span>
              <span>{householder?.location}</span>
            </div>
            <div>
              <span>
                <strong>Members Size:</strong>
              </span>
              <span>{householder?.members_size}</span>
            </div>
            <div>
              <span>
                <strong>House Status:</strong>
              </span>
              <span>
                {householder?.house_status.type === "Ready"
                  ? `Ready`
                  : householder?.house_status.type === "NeedsSomeWork"
                  ? `Needs Some Work`
                  : `Needs To Be Built`}
              </span>
            </div>
            <div>
              <span>
                <strong>Time Of Posting:</strong>
              </span>
              <span>{new Date(householder?.time_of_posting as number / 1000).toLocaleString()}</span>
            </div>
            <div>
              <button onClick={() => setEditing(true)}>edit</button>
              <button onClick={deleteHouseholder}>delete</button>
            </div>
          </section>
        )
        : <div className="alert">The requested householder was not found.</div>}
    </div>
  );
};

interface HouseholderDetailProps {
  householderHash: Uint8Array;
  onHouseholderDeleted?: (householderHash: Uint8Array) => void;
}

export default HouseholderDetail;
