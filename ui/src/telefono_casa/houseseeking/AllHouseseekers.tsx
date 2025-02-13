import { HolochainError, Link, SignalCb, SignalType } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import HouseseekerDetail from "./HouseseekerDetail";
import type { HouseseekingSignal } from "./types";

const AllHouseseekers: FC = () => {
  const { client } = useContext(ClientContext);
  const [hashes, setHashes] = useState<Uint8Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchHouseseekers = useCallback(async () => {
    setLoading(true);
    try {
      const links: Link[] = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "houseseeking",
        fn_name: "get_all_houseseekers",
        payload: null,
      });
      if (links?.length) {
        setHashes(links.map((l) => l.target));
      }
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const handleSignal: SignalCb = useCallback((signal) => {
    if (!(SignalType.App in signal)) return;
    if (signal.App.zome_name !== "houseseeking") return;
    const payload = signal.App.payload as HouseseekingSignal;
    if (payload.type !== "EntryCreated") return;
    if (payload.app_entry.type !== "Houseseeker") return;
    setHashes((prevHashes) => [...prevHashes, payload.action.hashed.hash]);
  }, [setHashes]);

  useEffect(() => {
    fetchHouseseekers();
    client?.on("signal", handleSignal);
  }, [client, handleSignal, fetchHouseseekers]);

  if (loading) {
    return <progress />;
  }

  return (
    <div>
      {error ? <div className="alert">Error fetching the houseseekers: {error.message}</div> : hashes.length > 0
        ? (
          <div>
            {hashes.map((hash, i) => (
              <HouseseekerDetail key={i} houseseekerHash={hash} onHouseseekerDeleted={fetchHouseseekers} />
            ))}
          </div>
        )
        : <div className="alert">No houseseekers found.</div>}
    </div>
  );
};

export default AllHouseseekers;
