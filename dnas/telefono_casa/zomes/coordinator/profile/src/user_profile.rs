use hash_type::Agent;
use hdk::prelude::*;
use profile_integrity::*;

#[hdk_extern]
pub fn create_user_profile(user_profile: UserProfile) -> ExternResult<Record> {
    let user_profile_hash = create_entry(&EntryTypes::UserProfile(user_profile.clone()))?;
    let record = get(user_profile_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly created UserProfile".to_string())
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_user_profile(
    original_user_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        GetLinksInputBuilder::try_new(
            original_user_profile_hash.clone(),
            LinkTypes::UserProfileUpdates,
        )?
        .build(),
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_user_profile_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(
                    "No action hash associated with link".to_string()
                )))?
        }
        None => original_user_profile_hash.clone(),
    };
    get(latest_user_profile_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_user_profile(
    original_user_profile_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_user_profile_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed get details response".to_string()
        ))),
    }
}

#[hdk_extern]
pub fn get_all_revisions_for_user_profile(
    original_user_profile_hash: ActionHash,
) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_user_profile(original_user_profile_hash.clone())?
    else {
        return Ok(vec![]);
    };
    let links = get_links(
        GetLinksInputBuilder::try_new(
            original_user_profile_hash.clone(),
            LinkTypes::UserProfileUpdates,
        )?
        .build(),
    )?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            Ok(GetInput::new(
                link.target
                    .into_action_hash()
                    .ok_or(wasm_error!(WasmErrorInner::Guest(
                        "No action hash associated with link".to_string()
                    )))?
                    .into(),
                GetOptions::default(),
            ))
        })
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().flatten().collect();
    records.insert(0, original_record);
    Ok(records)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateUserProfileInput {
    pub original_user_profile_hash: ActionHash,
    pub previous_user_profile_hash: ActionHash,
    pub updated_user_profile: UserProfile,
}

#[hdk_extern]
pub fn update_user_profile(input: UpdateUserProfileInput) -> ExternResult<Record> {
    let updated_user_profile_hash = update_entry(
        input.previous_user_profile_hash.clone(),
        &input.updated_user_profile,
    )?;
    create_link(
        input.original_user_profile_hash.clone(),
        updated_user_profile_hash.clone(),
        LinkTypes::UserProfileUpdates,
        (),
    )?;
    let record =
        get(updated_user_profile_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
            WasmErrorInner::Guest("Could not find the newly updated UserProfile".to_string())
        ))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_original_user_profile_for_agent(agent: AgentPubKey) -> ExternResult<Option<ActionHash>> {

    let filter = ChainQueryFilter::new().entry_type(UnitEntryTypes::UserProfile.try_into()?)
                                        .action_type(ActionType::Create);

    let activity = get_agent_activity(agent, filter, ActivityRequest::Full)?;

    let valid_activity = activity.valid_activity;
    let profile_action_hashes: Vec<ActionHash> = valid_activity
                                            .into_iter()
                                            .map(|(_sequence_number, action_hash)| action_hash)
                                            .collect();

    let Some(original_action_hash) = profile_action_hashes.first() else {
        return Ok(None);
    };

    Ok(Some(original_action_hash.clone()))
}