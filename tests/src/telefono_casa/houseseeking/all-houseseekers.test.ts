import { assert, test } from "vitest";

import {
  ActionHash,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  Link,
  NewEntryAction,
  Record,
} from "@holochain/client";
import { CallableCell, dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";

import { createHouseseeker } from "./common.js";

test("create a Houseseeker and get all houseseekers", async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/telefono-casa.happ";

    // Set up the app to be installed
    const appSource = { appBundleSource: { path: testAppPath } };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, bob] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Bob gets all houseseekers
    let collectionOutput: Link[] = await bob.cells[0].callZome({
      zome_name: "houseseeking",
      fn_name: "get_all_houseseekers",
      payload: null,
    });
    assert.equal(collectionOutput.length, 0);

    // Alice creates a Houseseeker
    const createRecord: Record = await createHouseseeker(alice.cells[0]);
    assert.ok(createRecord);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets all houseseekers again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "houseseeking",
      fn_name: "get_all_houseseekers",
      payload: null,
    });
    assert.equal(collectionOutput.length, 1);
    assert.deepEqual(createRecord.signed_action.hashed.hash, collectionOutput[0].target);

    // Alice deletes the Houseseeker
    await alice.cells[0].callZome({
      zome_name: "houseseeking",
      fn_name: "delete_houseseeker",
      payload: createRecord.signed_action.hashed.hash,
    });

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets all houseseekers again
    collectionOutput = await bob.cells[0].callZome({
      zome_name: "houseseeking",
      fn_name: "get_all_houseseekers",
      payload: null,
    });
    assert.equal(collectionOutput.length, 0);
  });
});
