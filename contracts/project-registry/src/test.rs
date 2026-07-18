#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};

#[test]
fn test_register_and_verify_project() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, ProjectRegistry);
    let client = ProjectRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);

    client.initialize(&admin);

    let project_name = String::from_str(&env, "Stellar SDK");
    let github_url = String::from_str(&env, "https://github.com/stellar/stellar-sdk");
    let description = String::from_str(&env, "Official Stellar SDK for JS/TS");
    let category = String::from_str(&env, "SDK");

    // Register project
    let project_id = client.register_project(
        &owner,
        &project_name,
        &github_url,
        &description,
        &category
    );

    assert_eq!(project_id, 1);
    assert_eq!(client.get_project_count(), 1);

    let project = client.get_project(&project_id).unwrap();
    assert_eq!(project.id, 1);
    assert_eq!(project.owner, owner);
    assert_eq!(project.name, project_name);
    assert_eq!(project.verified, false);

    // Try verifying the project
    client.verify_project(&project_id, &true);
    assert_eq!(client.is_project_verified(&project_id), true);

    let project_updated = client.get_project(&project_id).unwrap();
    assert_eq!(project_updated.verified, true);
}

#[test]
fn test_transfer_ownership_and_update() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, ProjectRegistry);
    let client = ProjectRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let new_owner = Address::generate(&env);

    client.initialize(&admin);

    let project_id = client.register_project(
        &owner,
        &String::from_str(&env, "Soroban Docs"),
        &String::from_str(&env, "https://github.com/stellar/soroban-docs"),
        &String::from_str(&env, "Documentation"),
        &String::from_str(&env, "Docs")
    );

    // Transfer ownership
    client.transfer_ownership(&project_id, &new_owner);
    assert_eq!(client.get_project_owner(&project_id), new_owner);

    // Update details (should work with new owner)
    let new_desc = String::from_str(&env, "Updated documentation page");
    let new_cat = String::from_str(&env, "Developer Education");
    client.update_project(&project_id, &new_desc, &new_cat);

    let project = client.get_project(&project_id).unwrap();
    assert_eq!(project.description, new_desc);
    assert_eq!(project.category, new_cat);
    assert_eq!(project.owner, new_owner);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #1)")]
fn test_double_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ProjectRegistry);
    let client = ProjectRegistryClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
    client.initialize(&admin); // Should fail
}
