#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token, Address, Env, String
};

use project_registry::{ProjectRegistry, ProjectRegistryClient};

#[test]
fn test_sponsorship_milestone_and_payout() {
    let env = Env::default();
    env.mock_all_auths();

    // Set initial ledger timestamp
    env.ledger().set_timestamp(1000);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let sponsor = Address::generate(&env);

    // Deploy ProjectRegistry
    let registry_id = env.register_contract(None, ProjectRegistry);
    let registry_client = ProjectRegistryClient::new(&env, &registry_id);
    registry_client.initialize(&admin);

    // Register a project in the registry
    let project_id = registry_client.register_project(
        &owner,
        &String::from_str(&env, "Rust Crypto"),
        &String::from_str(&env, "https://github.com/RustCrypto"),
        &String::from_str(&env, "Cryptography in Rust"),
        &String::from_str(&env, "Security")
    );

    // Verify the project so it can be sponsored
    registry_client.verify_project(&project_id, &true);

    // Deploy Mock Stellar Asset Contract (SAC)
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = token::Client::new(&env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_id);

    // Mint some tokens to the sponsor
    let sponsor_balance = 50000i128;
    token_admin_client.mint(&sponsor, &sponsor_balance);
    assert_eq!(token_client.balance(&sponsor), sponsor_balance);

    // Deploy SponsorVault
    let vault_id = env.register_contract(None, SponsorVault);
    let vault_client = SponsorVaultClient::new(&env, &vault_id);
    vault_client.initialize(&admin, &registry_id, &token_id);

    // Sponsor the project with 1000 tokens
    let sponsor_amount = 1000i128;
    vault_client.sponsor_project(&sponsor, &project_id, &sponsor_amount);

    // Verify balances
    assert_eq!(token_client.balance(&sponsor), sponsor_balance - sponsor_amount);
    assert_eq!(token_client.balance(&vault_id), sponsor_amount);
    assert_eq!(vault_client.get_contribution(&project_id, &sponsor), sponsor_amount);

    let escrow = vault_client.get_escrow(&project_id).unwrap();
    assert_eq!(escrow.total_sponsored, sponsor_amount);
    assert_eq!(escrow.balance, sponsor_amount);
    assert_eq!(escrow.milestone_count, 0);

    // Propose a milestone for 400 tokens
    let milestone_amount = 400i128;
    let title = String::from_str(&env, "Milestone 1");
    let description = String::from_str(&env, "Setup project repository and structure");
    let milestone_id = vault_client.propose_milestone(&project_id, &title, &description, &milestone_amount);

    assert_eq!(milestone_id, 1);
    let escrow_after = vault_client.get_escrow(&project_id).unwrap();
    assert_eq!(escrow_after.balance, sponsor_amount - milestone_amount);
    assert_eq!(escrow_after.milestone_count, 1);

    let milestone = vault_client.get_milestone(&project_id, &milestone_id).unwrap();
    assert_eq!(milestone.id, 1);
    assert_eq!(milestone.amount, milestone_amount);
    assert_eq!(milestone.status, 0); // Proposed

    // Owner starts the milestone (lockup window is 100 seconds)
    let lockup_duration = 100u64;
    vault_client.start_milestone(&project_id, &milestone_id, &lockup_duration);

    let milestone_active = vault_client.get_milestone(&project_id, &milestone_id).unwrap();
    assert_eq!(milestone_active.status, 1); // Active
    assert_eq!(milestone_active.release_time, 1000 + lockup_duration);

    // Fast forward ledger time to 1105 (passed release time of 1100)
    env.ledger().set_timestamp(1105);

    // Claim payout
    vault_client.claim_milestone_payout(&project_id, &milestone_id);

    let milestone_claimed = vault_client.get_milestone(&project_id, &milestone_id).unwrap();
    assert_eq!(milestone_claimed.status, 4); // Claimed

    // Check balances
    assert_eq!(token_client.balance(&owner), milestone_amount);
    assert_eq!(token_client.balance(&vault_id), sponsor_amount - milestone_amount);
}

#[test]
fn test_flag_and_resolve_milestone() {
    let env = Env::default();
    env.mock_all_auths();

    env.ledger().set_timestamp(1000);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let sponsor = Address::generate(&env);

    // Deploy registry and register/verify project
    let registry_id = env.register_contract(None, ProjectRegistry);
    let registry_client = ProjectRegistryClient::new(&env, &registry_id);
    registry_client.initialize(&admin);
    let project_id = registry_client.register_project(
        &owner,
        &String::from_str(&env, "Stellar Wallet"),
        &String::from_str(&env, "https://github.com/stellar/wallet"),
        &String::from_str(&env, "Stellar Wallet App"),
        &String::from_str(&env, "Wallet")
    );
    registry_client.verify_project(&project_id, &true);

    // Deploy SAC token
    let token_admin = Address::generate(&env);
    let token_id = env.register_stellar_asset_contract(token_admin);
    let token_client = token::Client::new(&env, &token_id);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_id);
    token_admin_client.mint(&sponsor, &10000);

    // Deploy SponsorVault
    let vault_id = env.register_contract(None, SponsorVault);
    let vault_client = SponsorVaultClient::new(&env, &vault_id);
    vault_client.initialize(&admin, &registry_id, &token_id);

    // Sponsor project
    vault_client.sponsor_project(&sponsor, &project_id, &1000);

    // Propose and start milestone
    let milestone_id = vault_client.propose_milestone(
        &project_id,
        &String::from_str(&env, "M1"),
        &String::from_str(&env, "M1 Desc"),
        &500
    );
    vault_client.start_milestone(&project_id, &milestone_id, &100);

    // Sponsor flags the milestone
    vault_client.flag_milestone(&sponsor, &project_id, &milestone_id);

    let milestone_flagged = vault_client.get_milestone(&project_id, &milestone_id).unwrap();
    assert_eq!(milestone_flagged.status, 2); // Flagged
    assert_eq!(milestone_flagged.flags_count, 1);

    // Admin resolves the flag - REJECT
    vault_client.resolve_flagged_milestone(&project_id, &milestone_id, &false);

    let milestone_rejected = vault_client.get_milestone(&project_id, &milestone_id).unwrap();
    assert_eq!(milestone_rejected.status, 0); // Resets to Proposed
    assert_eq!(milestone_rejected.flags_count, 0);

    // Escrow balance should be restored to 1000
    let escrow = vault_client.get_escrow(&project_id).unwrap();
    assert_eq!(escrow.balance, 1000);
}
