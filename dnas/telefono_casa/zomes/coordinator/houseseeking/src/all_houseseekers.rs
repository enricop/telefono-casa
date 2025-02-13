use hdk::prelude::*;
use houseseeking_integrity::*;

#[hdk_extern]
pub fn get_all_houseseekers() -> ExternResult<Vec<Link>> {
    let path = Path::from("all_houseseekers");
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::AllHouseseekers)?.build(),
    )
}
