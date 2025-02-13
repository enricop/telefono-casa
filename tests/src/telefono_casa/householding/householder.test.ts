import { assert, test } from "vitest";

import {
  ActionHash,
  AppBundleSource,
  CreateLink,
  DeleteLink,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  Link,
  NewEntryAction,
  Record,
  SignedActionHashed,
} from "@holochain/client";
import { CallableCell, dhtSync, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";

import { createHouseholder, sampleHouseholder } from "./common.js";

test("create Householder", async () => {
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

    // Alice creates a Householder
    const record: Record = await createHouseholder(alice.cells[0]);
    assert.ok(record);
  });
});

test("create and read Householder", async () => {
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

    const sample = await sampleHouseholder(alice.cells[0]);

    // Alice creates a Householder
    const record: Record = await createHouseholder(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the created Householder
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_original_householder",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);
  });
});

test("create and update Householder", async () => {
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

    // Alice creates a Householder
    const record: Record = await createHouseholder(alice.cells[0]);
    assert.ok(record);

    const originalActionHash = record.signed_action.hashed.hash;

    // Alice updates the Householder
    let contentUpdate: any = await sampleHouseholder(alice.cells[0]);
    let updateInput = {
      original_householder_hash: originalActionHash,
      previous_householder_hash: originalActionHash,
      updated_householder: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "householding",
      fn_name: "update_householder",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the updated Householder
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_latest_householder",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the Householder again
    contentUpdate = await sampleHouseholder(alice.cells[0]);
    updateInput = {
      original_householder_hash: originalActionHash,
      previous_householder_hash: updatedRecord.signed_action.hashed.hash,
      updated_householder: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "householding",
      fn_name: "update_householder",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the updated Householder
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_latest_householder",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);

    // Bob gets all the revisions for Householder
    const revisions: Record[] = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_all_revisions_for_householder",
      payload: originalActionHash,
    });
    assert.equal(revisions.length, 3);
    assert.deepEqual(contentUpdate, decode((revisions[2].entry as any).Present.entry) as any);
  });
});

test("create and delete Householder", async () => {
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

    const sample = await sampleHouseholder(alice.cells[0]);

    // Alice creates a Householder
    const record: Record = await createHouseholder(alice.cells[0], sample);
    assert.ok(record);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice deletes the Householder
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "householding",
      fn_name: "delete_householder",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(deleteActionHash);

    // Wait for the entry deletion to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the oldest delete for the Householder
    const oldestDeleteForHouseholder: SignedActionHashed = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_oldest_delete_for_householder",
      payload: record.signed_action.hashed.hash,
    });
    assert.ok(oldestDeleteForHouseholder);

    // Bob gets the deletions for the Householder
    const deletesForHouseholder: SignedActionHashed[] = await bob.cells[0].callZome({
      zome_name: "householding",
      fn_name: "get_all_deletes_for_householder",
      payload: record.signed_action.hashed.hash,
    });
    assert.equal(deletesForHouseholder.length, 1);
  });
});
