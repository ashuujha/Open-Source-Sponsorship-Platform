#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, contractclient, token, Address, Env, String, BytesN, panic_with_error
};

#[contractclient(name = "RegistryClient")]
pub trait RegistryInterface {
    fn get_project_owner(env: Env, project_id: u64) -> Address;
    fn is_project_verified(env: Env, project_id: u64) -> bool;
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct ProjectEscrow {
    pub project_id: u64,
    pub total_sponsored: i128,
    pub balance: i128, // unallocated funds
    pub milestone_count: u32,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Milestone {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub status: u32,       // 0 = Proposed, 1 = Active, 2 = Flagged, 3 = Completed, 4 = Claimed
    pub flags_count: u32,
    pub release_time: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    RegistryAddress,
    AssetAddress,
    Escrow(u64),
    Milestone(u64, u32),
    SponsorContribution(u64, Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ErrorCode {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    ProjectNotVerified = 3,
    InsufficientBalance = 4,
    MilestoneNotFound = 5,
    InvalidStatus = 6,
    MilestoneLocked = 7,
    NotSponsor = 8,
    NotAuthorized = 9,
}

#[contract]
pub struct SponsorVault;

#[contractimpl]
impl SponsorVault {
    /// Initializes the Sponsorship Vault.
    pub fn initialize(env: Env, admin: Address, registry: Address, asset: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, ErrorCode::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RegistryAddress, &registry);
        env.storage().instance().set(&DataKey::AssetAddress, &asset);
    }

    /// Sponsors a project by depositing SAC tokens.
    pub fn sponsor_project(env: Env, sponsor: Address, project_id: u64, amount: i128) {
        sponsor.require_auth();

        let registry_addr = Self::get_registry_address(env.clone());
        let registry_client = RegistryClient::new(&env, &registry_addr);

        // Inter-contract call: Check if project is verified
        let is_verified = registry_client.is_project_verified(&project_id);
        if !is_verified {
            panic_with_error!(&env, ErrorCode::ProjectNotVerified);
        }

        // Pull tokens from sponsor to vault
        let asset_addr = Self::get_asset_address(env.clone());
        let token_client = token::Client::new(&env, &asset_addr);
        token_client.transfer(&sponsor, &env.current_contract_address(), &amount);

        // Update escrow info
        let escrow_key = DataKey::Escrow(project_id);
        let mut escrow = env.storage().persistent().get(&escrow_key).unwrap_or(ProjectEscrow {
            project_id,
            total_sponsored: 0,
            balance: 0,
            milestone_count: 0,
        });

        escrow.total_sponsored += amount;
        escrow.balance += amount;
        env.storage().persistent().set(&escrow_key, &escrow);

        // Update sponsor contribution
        let contribution_key = DataKey::SponsorContribution(project_id, sponsor.clone());
        let mut contribution = env.storage().persistent().get(&contribution_key).unwrap_or(0i128);
        contribution += amount;
        env.storage().persistent().set(&contribution_key, &contribution);

        // Emit sponsor event
        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "project_sponsored")),
            (project_id, sponsor, amount),
        );
    }

    /// Proposes a new milestone for the project (Project Owner only).
    pub fn propose_milestone(
        env: Env,
        project_id: u64,
        title: String,
        description: String,
        amount: i128,
    ) -> u32 {
        let registry_addr = Self::get_registry_address(env.clone());
        let registry_client = RegistryClient::new(&env, &registry_addr);

        // Inter-contract call: Get owner and verify owner auth
        let owner = registry_client.get_project_owner(&project_id);
        owner.require_auth();

        let escrow_key = DataKey::Escrow(project_id);
        let mut escrow: ProjectEscrow = env
            .storage()
            .persistent()
            .get(&escrow_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::ProjectNotVerified));

        // Check if there is enough unallocated balance in escrow
        if escrow.balance < amount {
            panic_with_error!(&env, ErrorCode::InsufficientBalance);
        }

        // Deduct from unallocated escrow balance immediately to lock it
        escrow.balance -= amount;
        escrow.milestone_count += 1;
        let milestone_id = escrow.milestone_count;

        env.storage().persistent().set(&escrow_key, &escrow);

        let milestone = Milestone {
            id: milestone_id,
            title,
            description,
            amount,
            status: 0, // Proposed
            flags_count: 0,
            release_time: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Milestone(project_id, milestone_id), &milestone);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "milestone_proposed")),
            (project_id, milestone_id, amount),
        );

        milestone_id
    }

    /// Activates a milestone to begin the challenge window (Project Owner only).
    pub fn start_milestone(env: Env, project_id: u64, milestone_id: u32, lockup_duration: u64) {
        let registry_addr = Self::get_registry_address(env.clone());
        let registry_client = RegistryClient::new(&env, &registry_addr);

        let owner = registry_client.get_project_owner(&project_id);
        owner.require_auth();

        let ms_key = DataKey::Milestone(project_id, milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::MilestoneNotFound));

        if milestone.status != 0 {
            panic_with_error!(&env, ErrorCode::InvalidStatus);
        }

        milestone.status = 1; // Active
        milestone.release_time = env.ledger().timestamp() + lockup_duration;
        env.storage().persistent().set(&ms_key, &milestone);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "milestone_activated")),
            (project_id, milestone_id, milestone.release_time),
        );
    }

    /// Flags an active milestone payout request (Sponsor only).
    pub fn flag_milestone(env: Env, sponsor: Address, project_id: u64, milestone_id: u32) {
        sponsor.require_auth();

        // Verify sponsor has actually sponsored the project
        let contribution_key = DataKey::SponsorContribution(project_id, sponsor.clone());
        let contribution: i128 = env
            .storage()
            .persistent()
            .get(&contribution_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotSponsor));

        if contribution <= 0 {
            panic_with_error!(&env, ErrorCode::NotSponsor);
        }

        let ms_key = DataKey::Milestone(project_id, milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::MilestoneNotFound));

        if milestone.status != 1 {
            panic_with_error!(&env, ErrorCode::InvalidStatus);
        }

        milestone.status = 2; // Flagged
        milestone.flags_count += 1;
        env.storage().persistent().set(&ms_key, &milestone);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "milestone_flagged")),
            (project_id, milestone_id, sponsor),
        );
    }

    /// Resolves a flagged milestone (Admin only).
    pub fn resolve_flagged_milestone(
        env: Env,
        project_id: u64,
        milestone_id: u32,
        approve: bool,
    ) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();

        let ms_key = DataKey::Milestone(project_id, milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::MilestoneNotFound));

        if milestone.status != 2 {
            panic_with_error!(&env, ErrorCode::InvalidStatus);
        }

        if approve {
            // Admin approves the milestone, transition status to Completed (status 3) so it can be claimed
            milestone.status = 3;
            env.storage().persistent().set(&ms_key, &milestone);
        } else {
            // Admin rejects the milestone, return funds to project's escrow balance
            let escrow_key = DataKey::Escrow(project_id);
            let mut escrow: ProjectEscrow = env
                .storage()
                .persistent()
                .get(&escrow_key)
                .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotInitialized));

            escrow.balance += milestone.amount;
            env.storage().persistent().set(&escrow_key, &escrow);

            // Set milestone status back to Proposed (status 0) or rejected (funds refunded to escrow)
            milestone.status = 0;
            milestone.flags_count = 0;
            milestone.release_time = 0;
            env.storage().persistent().set(&ms_key, &milestone);
        }

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "milestone_resolved")),
            (project_id, milestone_id, approve),
        );
    }

    /// Claims a completed milestone payout (Project Owner only).
    pub fn claim_milestone_payout(env: Env, project_id: u64, milestone_id: u32) {
        let registry_addr = Self::get_registry_address(env.clone());
        let registry_client = RegistryClient::new(&env, &registry_addr);

        let owner = registry_client.get_project_owner(&project_id);
        owner.require_auth();

        let ms_key = DataKey::Milestone(project_id, milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&ms_key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::MilestoneNotFound));

        // Must be Active (status 1, and release_time passed) OR resolved as Completed (status 3) by admin
        if milestone.status == 1 {
            if env.ledger().timestamp() < milestone.release_time {
                panic_with_error!(&env, ErrorCode::MilestoneLocked);
            }
        } else if milestone.status != 3 {
            panic_with_error!(&env, ErrorCode::InvalidStatus);
        }

        // Payout transfer
        let asset_addr = Self::get_asset_address(env.clone());
        let token_client = token::Client::new(&env, &asset_addr);
        token_client.transfer(&env.current_contract_address(), &owner, &milestone.amount);

        milestone.status = 4; // Claimed
        env.storage().persistent().set(&ms_key, &milestone);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "milestone_payout_claimed")),
            (project_id, milestone_id, owner, milestone.amount),
        );
    }

    /// Upgrades the contract WASM code (Admin only).
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    // Getters

    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotInitialized))
    }

    pub fn get_registry_address(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::RegistryAddress)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotInitialized))
    }

    pub fn get_asset_address(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::AssetAddress)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotInitialized))
    }

    pub fn get_escrow(env: Env, project_id: u64) -> Option<ProjectEscrow> {
        env.storage().persistent().get(&DataKey::Escrow(project_id))
    }

    pub fn get_milestone(env: Env, project_id: u64, milestone_id: u32) -> Option<Milestone> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(project_id, milestone_id))
    }

    pub fn get_contribution(env: Env, project_id: u64, sponsor: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::SponsorContribution(project_id, sponsor))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
