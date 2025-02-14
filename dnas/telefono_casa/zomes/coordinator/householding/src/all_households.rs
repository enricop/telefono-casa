use hdk::prelude::*;
use householding_integrity::*;

#[hdk_extern]
pub fn get_all_households() -> ExternResult<Vec<Link>> {
    let path = Path::from("all_households");
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllHouseholds)?.build(),
    )
}

pub fn get_all_households_in_location(location : String) -> ExternResult<Vec<Link>> {

    let pathformat = format!("all_households_by_location.{}", location);

    let path = Path::from(pathformat);
    
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllHouseholdsByLocation)?.build(),
    )
}
