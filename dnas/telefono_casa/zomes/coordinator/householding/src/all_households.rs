use hdk::prelude::*;
use householding_integrity::*;

#[hdk_extern]
pub fn get_all_households() -> ExternResult<Vec<Link>> {
    let path = Path::from("all_households");
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllHouseholds)?.build(),
    )
}
