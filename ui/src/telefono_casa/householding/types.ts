import type {
  ActionHash,
  AgentPubKey,
  Create,
  CreateLink,
  Delete,
  DeleteLink,
  DnaHash,
  EntryHash,
  ExternalHash,
  ExternalHash,
  Record,
  SignedActionHashed,
  Update,
} from "@holochain/client";

export type HouseholdingSignal = {
  type: "EntryCreated";
  action: SignedActionHashed<Create>;
  app_entry: EntryTypes;
} | {
  type: "EntryUpdated";
  action: SignedActionHashed<Update>;
  app_entry: EntryTypes;
  original_app_entry: EntryTypes;
} | {
  type: "EntryDeleted";
  action: SignedActionHashed<Delete>;
  original_app_entry: EntryTypes;
} | {
  type: "LinkCreated";
  action: SignedActionHashed<CreateLink>;
  link_type: string;
} | {
  type: "LinkDeleted";
  action: SignedActionHashed<DeleteLink>;
  link_type: string;
};

/* dprint-ignore-start */
export type EntryTypes =
 | ({  type: 'Householder'; } & Householder);
/* dprint-ignore-end */

export type HouseStatus = {type: 'Ready'} | {type: 'NeedsSomeWork'} | {type: 'NeedsToBeBuilt'};

export interface Householder {
  title: string;
  location: string;
  members_size: number;
  house_status: HouseStatus;
  time_of_posting: number;
}
