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

export async function sampleHouseseeker(cell: CallableCell, partialHouseseeker = {}) {
  return {
    ...{
      location: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      location_lookingfor: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      date_of_posting: 1674053334548000,
    },
    ...partialHouseseeker,
  };
}

export async function createHouseseeker(cell: CallableCell, houseseeker = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "houseseeking",
    fn_name: "create_houseseeker",
    payload: houseseeker || await sampleHouseseeker(cell),
  });
}
