import { HolochainError, Link, SignalCb, SignalType } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import HouseholderDetail from "./HouseholderDetail";
import type { HouseholdingSignal } from "./types";

const AllHouseholds: FC = () => {
  const { client } = useContext(ClientContext);
  const [hashes, setHashes] = useState<Uint8Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchHouseholders = useCallback(async () => {
    setLoading(true);
    try {
      const links: Link[] = await client?.callZome({
        cap_secret: null,
        role_name: "telefono_casa",
        zome_name: "householding",
        fn_name: "get_all_households",
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
    if (signal.App.zome_name !== "householding") return;
    const payload = signal.App.payload as HouseholdingSignal;
    if (payload.type !== "EntryCreated") return;
    if (payload.app_entry.type !== "Householder") return;
    setHashes((prevHashes) => [...prevHashes, payload.action.hashed.hash]);
  }, [setHashes]);

  useEffect(() => {
    fetchHouseholders();
    client?.on("signal", handleSignal);
  }, [client, handleSignal, fetchHouseholders]);

  if (loading) {
    return <progress />;
  }

  return (
    <div>
      {error ? <div className="alert">Error fetching the householders: {error.message}</div> : hashes.length > 0
        ? (
          <div>
            {hashes.map((hash, i) => (
              <HouseholderDetail key={i} householderHash={hash} onHouseholderDeleted={fetchHouseholders} />
            ))}
          </div>
        )
        : <div className="alert">No householders found.</div>}
    </div>
  );
};

export default AllHouseholds;
