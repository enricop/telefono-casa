import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import EditHouseseeker from "./EditHouseseeker";
import type { Houseseeker } from "./types";

const HouseseekerDetail: FC<HouseseekerDetailProps> = ({ houseseekerHash, onHouseseekerDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [houseseeker, setHouseseeker] = useState<Houseseeker | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchHouseseeker = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "houseseeking",
        fn_name: "get_latest_houseseeker",
        payload: houseseekerHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, houseseekerHash]);

  const deleteHouseseeker = async () => {
    setLoading(true);
    try {
      await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "houseseeking",
        fn_name: "delete_houseseeker",
        payload: houseseekerHash,
      });
      onHouseseekerDeleted && onHouseseekerDeleted(houseseekerHash);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!houseseekerHash) {
      throw new Error(`The houseseekerHash prop is required for this component`);
    }
    fetchHouseseeker();
  }, [fetchHouseseeker, houseseekerHash]);

  useEffect(() => {
    if (!record) return;
    setHouseseeker(decode((record.entry as any).Present.entry) as Houseseeker);
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
            <EditHouseseeker
              originalHouseseekerHash={houseseekerHash}
              currentRecord={record}
              currentHouseseeker={houseseeker}
              onHouseseekerUpdated={async () => {
                setEditing(false);
                await fetchHouseseeker();
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
                <strong>Location:</strong>
              </span>
              <span>{houseseeker?.location}</span>
            </div>
            <div>
              <span>
                <strong>Location Lookingfor:</strong>
              </span>
              <span>{houseseeker?.location_lookingfor}</span>
            </div>
            <div>
              <span>
                <strong>Date Of Posting:</strong>
              </span>
              <span>{new Date(houseseeker?.date_of_posting as number / 1000).toLocaleString()}</span>
            </div>
            <div>
              <button onClick={() => setEditing(true)}>edit</button>
              <button onClick={deleteHouseseeker}>delete</button>
            </div>
          </section>
        )
        : <div className="alert">The requested houseseeker was not found.</div>}
    </div>
  );
};

interface HouseseekerDetailProps {
  houseseekerHash: Uint8Array;
  onHouseseekerDeleted?: (houseseekerHash: Uint8Array) => void;
}

export default HouseseekerDetail;
