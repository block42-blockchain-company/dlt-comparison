#![feature(try_from)]
#[macro_use]
extern crate hdk;
#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate holochain_core_types_derive;

use hdk::{
    error::ZomeApiResult,
    holochain_core_types::{
        hash::HashString,
        error::HolochainError,
        dna::entry_types::Sharing,
        json::JsonString,
        cas::content::Address,
        entry::Entry,
    }
};

macro_rules! hashmap {
    ($( $key: expr => $val: expr ),*) => {{
         let mut map = ::std::collections::HashMap::new();
         $( map.insert($key, $val); )*
         map
    }}
}
 
define_zome! {
    entries: [
        entry!(
            name: "alliance",
            description: "Coalition of families to fight together.",
            sharing: Sharing::Public,
            validation_package: || hdk::ValidationPackageDefinition::Entry,
            validation: |validation_data: hdk::EntryValidationData<Alliance>| {
                Ok(())
            },
            links: [
                to!(
                    "family",
                    tag: "families",
                    validation_package: || hdk::ValidationPackageDefinition::Entry,
                    validation: |_validation_data: hdk::LinkValidationData| {
                        Ok(())
                    }
                )
            ]
        ),
        entry!(
            name: "family",
            description: "One of the famous families of game of thrones.",
            sharing: Sharing::Public,
            validation_package: || hdk::ValidationPackageDefinition::Entry,
            validation: |validation_data: hdk::EntryValidationData<Family>| {
                Ok(())
            }
        )
    ]
 
    genesis: || {
        Ok(())
    }
 
    functions: [
        create_alliance: {
            inputs: |alliance: Alliance|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_create_alliance
        }
        link_family: {
            inputs: |family_addr: HashString, alliance_addr: HashString|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_link_family
        }
        add_family: {
            inputs: |family: Family|,
            outputs: |result: ZomeApiResult<Address>|,
            handler: handle_add_family
        }
        get_alliance: {
            inputs: |alliance_addr: HashString|,
            outputs: |result: ZomeApiResult<GetAllianceResponse>|,
            handler: handle_get_alliance
        }
        change_alliance: {
            inputs: |family_addr: HashString, oldAlliance_addr: HashString, newAlliance_addr: HashString|,
            outputs: |result: ZomeApiResult<()>|,
            handler: handle_change_alliance
        }
    ]
    traits: {
        hc_public [create_alliance, link_family, add_family, get_alliance, change_alliance]
    }
}


#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
struct Alliance {
    name: String
}

#[derive(Serialize, Deserialize, Debug, Clone, DefaultJson)]
struct Family {
    text: String,
    completed: bool
}

#[derive(Serialize, Deserialize, Debug, DefaultJson)]
struct GetAllianceResponse {
    name: String,
    families: Vec<Family>
}

const allFamilyNames: [&'static str; 8] = ["Stark", "Targaryen", "Lannister", "Greyjoy", "Tyrell", "Martell", "Tully", "Arryn"];

fn handle_create_alliance(alliance: Alliance) -> ZomeApiResult<Address> {
    // define the entry
    let alliance_entry = Entry::App(
        "alliance".into(),
        alliance.into()
    );

    // commit the entry and return the address
    hdk::commit_entry(&alliance_entry)
}

fn handle_add_family(family: Family) -> ZomeApiResult<Address> {
    let mut i = 0;
    let mut validName = false;
    while i < 8 {
        if(allFamilyNames[i] == &family.text) {
            validName = true;
            break;
        }
        i += 1;
    }
    
    assert!(validName);

    let family_entry = Entry::App(
        "family".into(),
        family.into()
    );
    hdk::commit_entry(&family_entry)
}

fn handle_link_family(family_addr: HashString, alliance_addr: HashString) -> ZomeApiResult<Address> {
    let link_return = hdk::link_entries(&alliance_addr, &family_addr, "families")?; // if successful, link to list address
    Ok(family_addr)
}

fn handle_get_alliance(alliance_addr: HashString) -> ZomeApiResult<GetAllianceResponse> {

    // load the list entry. Early return error if it cannot load or is wrong type
    let alliance = hdk::utils::get_as_type::<Alliance>(alliance_addr.clone())?;

    // try and load the list items, filter out errors and collect in a vector
    let all_families = hdk::get_links(&alliance_addr, "families")?.addresses()
        .iter()
        .map(|family_address| {
            hdk::utils::get_as_type::<Family>(family_address.to_owned())
        })
        .filter_map(Result::ok)
        .collect::<Vec<Family>>();

    // if this was successful then return the list items
    Ok(GetAllianceResponse{
        name: alliance.name,
        families: all_families
    })
}

fn handle_change_alliance(family_addr: HashString, oldAlliance_addr: HashString, newAlliance_addr: HashString) -> ZomeApiResult<()> {
    let remove_link_return = hdk::remove_link(&oldAlliance_addr, &family_addr, "families")?;
    let add_link_return = hdk::link_entries(&newAlliance_addr, &family_addr, "families")?;
    Ok(())
}