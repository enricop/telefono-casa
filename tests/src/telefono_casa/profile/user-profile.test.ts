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

import { createUserProfile, sampleUserProfile } from "./common.js";

test("create UserProfile", async () => {
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

    // Alice creates a UserProfile
    const record: Record = await createUserProfile(alice.cells[0]);
    assert.ok(record);
  });
});

test("create and read UserProfile", async () => {
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

    const sample = await sampleUserProfile(alice.cells[0]);

    // Alice creates a UserProfile
    const record: Record = await createUserProfile(alice.cells[0], sample);
    assert.ok(record);

    // Wait for the created entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the created UserProfile
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "profile",
      fn_name: "get_original_user_profile",
      payload: record.signed_action.hashed.hash,
    });
    assert.deepEqual(sample, decode((createReadOutput.entry as any).Present.entry) as any);
  });
});

test("create and update UserProfile", async () => {
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

    // Alice creates a UserProfile
    const record: Record = await createUserProfile(alice.cells[0]);
    assert.ok(record);

    const originalActionHash = record.signed_action.hashed.hash;

    // Alice updates the UserProfile
    let contentUpdate: any = await sampleUserProfile(alice.cells[0]);
    let updateInput = {
      original_user_profile_hash: originalActionHash,
      previous_user_profile_hash: originalActionHash,
      updated_user_profile: contentUpdate,
    };

    let updatedRecord: Record = await alice.cells[0].callZome({
      zome_name: "profile",
      fn_name: "update_user_profile",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the updated UserProfile
    const readUpdatedOutput0: Record = await bob.cells[0].callZome({
      zome_name: "profile",
      fn_name: "get_latest_user_profile",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput0.entry as any).Present.entry) as any);

    // Alice updates the UserProfile again
    contentUpdate = await sampleUserProfile(alice.cells[0]);
    updateInput = {
      original_user_profile_hash: originalActionHash,
      previous_user_profile_hash: updatedRecord.signed_action.hashed.hash,
      updated_user_profile: contentUpdate,
    };

    updatedRecord = await alice.cells[0].callZome({
      zome_name: "profile",
      fn_name: "update_user_profile",
      payload: updateInput,
    });
    assert.ok(updatedRecord);

    // Wait for the updated entry to be propagated to the other node.
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob gets the updated UserProfile
    const readUpdatedOutput1: Record = await bob.cells[0].callZome({
      zome_name: "profile",
      fn_name: "get_latest_user_profile",
      payload: updatedRecord.signed_action.hashed.hash,
    });
    assert.deepEqual(contentUpdate, decode((readUpdatedOutput1.entry as any).Present.entry) as any);

    // Bob gets all the revisions for UserProfile
    const revisions: Record[] = await bob.cells[0].callZome({
      zome_name: "profile",
      fn_name: "get_all_revisions_for_user_profile",
      payload: originalActionHash,
    });
    assert.equal(revisions.length, 3);
    assert.deepEqual(contentUpdate, decode((revisions[2].entry as any).Present.entry) as any);
  });
});
