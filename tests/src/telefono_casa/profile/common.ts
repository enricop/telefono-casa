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

export async function sampleUserProfile(cell: CallableCell, partialUserProfile = {}) {
  return {
    ...{
      username: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      first_name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      last_name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      email_address: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      password: hashFrom32AndType(new Uint8Array(39).fill(1), "External"),
    },
    ...partialUserProfile,
  };
}

export async function createUserProfile(cell: CallableCell, userProfile = undefined): Promise<Record> {
  return cell.callZome({
    zome_name: "profile",
    fn_name: "create_user_profile",
    payload: userProfile || await sampleUserProfile(cell),
  });
}
