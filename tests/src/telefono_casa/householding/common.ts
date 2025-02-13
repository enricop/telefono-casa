import {
  ActionHash,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeDnaHash,
  fakeEntryHash,
  hashFrom32AndType,
  NewEntryAction,
  Record,
} from "@holochain/client";
import { CallableCell } from "@holochain/tryorama";

export async function sampleHouseholder(cell: CallableCell, partialHouseholder = {}) {
  return {
    ...{
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      location: "italy.emiliaromagna.forlicesena",
      members_size: 10,
      house_status: { type: "Ready" },
      time_of_posting: 1674053334548000,
    },
    ...partialHouseholder,
  };
}

export async function createHouseholder(cell: CallableCell, householder = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "householding",
    fn_name: "create_householder",
    payload: householder || await sampleHouseholder(cell),
  });
}
