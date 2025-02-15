use hdk::prelude::*;
use householding_integrity::*;

#[hdk_extern]
pub fn create_householder(householder: Householder) -> ExternResult<Record> {
    let householder_hash = create_entry(&EntryTypes::Householder(householder.clone()))?;
    let record = get(householder_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly created Householder".to_string())
    ))?;

    let pathformat = format!("all_households_by_location.{}", householder.location);
    let pathbylocation = Path::from(pathformat);
    let typed_pathbylocation = pathbylocation.clone().typed(LinkTypes::AllHouseholdsByLocation)?;
    typed_pathbylocation.ensure()?;
    create_link(
        typed_pathbylocation.path_entry_hash()?,
        householder_hash.clone(),
        LinkTypes::AllHouseholdsByLocation,
        (),
    )?;

    let path = Path::from("all_households");
    create_link(
        path.path_entry_hash()?,
        householder_hash.clone(),
        LinkTypes::AllHouseholds,
        (),
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn get_latest_householder(
    original_householder_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let links = get_links(
        GetLinksInputBuilder::try_new(
            original_householder_hash.clone(),
            LinkTypes::HouseholderUpdates,
        )?
        .build(),
    )?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_householder_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(wasm_error!(WasmErrorInner::Guest(
                    "No action hash associated with link".to_string()
                )))?
        }
        None => original_householder_hash.clone(),
    };
    get(latest_householder_hash, GetOptions::default())
}

#[hdk_extern]
pub fn get_original_householder(
    original_householder_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_householder_hash, GetOptions::default())? else {
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
pub fn get_all_revisions_for_householder(
    original_householder_hash: ActionHash,
) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_householder(original_householder_hash.clone())? else {
        return Ok(vec![]);
    };
    let links = get_links(
        GetLinksInputBuilder::try_new(
            original_householder_hash.clone(),
            LinkTypes::HouseholderUpdates,
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
pub struct UpdateHouseholderInput {
    pub original_householder_hash: ActionHash,
    pub previous_householder_hash: ActionHash,
    pub updated_householder: Householder,
}

#[hdk_extern]
pub fn update_householder(input: UpdateHouseholderInput) -> ExternResult<Record> {
    let updated_householder_hash = update_entry(
        input.previous_householder_hash.clone(),
        &input.updated_householder,
    )?;
    create_link(
        input.original_householder_hash.clone(),
        updated_householder_hash.clone(),
        LinkTypes::HouseholderUpdates,
        (),
    )?;
    let record =
        get(updated_householder_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
            WasmErrorInner::Guest("Could not find the newly updated Householder".to_string())
        ))?;
    Ok(record)
}

#[hdk_extern]
pub fn delete_householder(original_householder_hash: ActionHash) -> ExternResult<ActionHash> {
    let path = Path::from("all_households");
    let links = get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllHouseholds)?.build(),
    )?;
    for link in links {
        if let Some(hash) = link.target.into_action_hash() {
            if hash == original_householder_hash {
                delete_link(link.create_link_hash)?;
            }
        }
    }
    delete_entry(original_householder_hash)
}

#[hdk_extern]
pub fn get_all_deletes_for_householder(
    original_householder_hash: ActionHash,
) -> ExternResult<Option<Vec<SignedActionHashed>>> {
    let Some(details) = get_details(original_householder_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(record_details) => Ok(Some(record_details.deletes)),
    }
}

#[hdk_extern]
pub fn get_oldest_delete_for_householder(
    original_householder_hash: ActionHash,
) -> ExternResult<Option<SignedActionHashed>> {
    let Some(mut deletes) = get_all_deletes_for_householder(original_householder_hash)? else {
        return Ok(None);
    };
    deletes.sort_by(|delete_a, delete_b| {
        delete_a
            .action()
            .timestamp()
            .cmp(&delete_b.action().timestamp())
    });
    Ok(deletes.first().cloned())
}
