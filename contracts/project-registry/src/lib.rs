#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, String, BytesN, panic_with_error};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Project {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub github_url: String,
    pub description: String,
    pub category: String,
    pub verified: bool,
    pub registered_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    ProjectCount,
    Project(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ErrorCode {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    ProjectNotFound = 3,
    NotAuthorized = 4,
}

#[contract]
pub struct ProjectRegistry;

#[contractimpl]
impl ProjectRegistry {
    /// Initializes the registry with the administrative address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic_with_error!(&env, ErrorCode::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ProjectCount, &0u64);
    }

    /// Registers a new open-source project.
    pub fn register_project(
        env: Env,
        owner: Address,
        name: String,
        github_url: String,
        description: String,
        category: String,
    ) -> u64 {
        owner.require_auth();

        let mut count: u64 = env.storage().instance().get(&DataKey::ProjectCount).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&DataKey::ProjectCount, &count);

        let project = Project {
            id: count,
            owner: owner.clone(),
            name,
            github_url,
            description,
            category,
            verified: false,
            registered_at: env.ledger().timestamp(),
        };

        // Persistent storage for projects
        env.storage().persistent().set(&DataKey::Project(count), &project);

        // Emit project registered event
        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "project_registered")),
            (count, owner),
        );

        count
    }

    /// Verifies or unverifies a project (Admin only).
    pub fn verify_project(env: Env, project_id: u64, verified: bool) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();

        let key = DataKey::Project(project_id);
        let mut project: Project = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::ProjectNotFound));

        project.verified = verified;
        env.storage().persistent().set(&key, &project);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "project_verified")),
            (project_id, verified),
        );
    }

    /// Transfers ownership of a project to a new owner.
    pub fn transfer_ownership(env: Env, project_id: u64, new_owner: Address) {
        let key = DataKey::Project(project_id);
        let mut project: Project = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::ProjectNotFound));

        project.owner.require_auth();
        let old_owner = project.owner.clone();
        project.owner = new_owner.clone();
        env.storage().persistent().set(&key, &project);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "ownership_transferred")),
            (project_id, old_owner, new_owner),
        );
    }

    /// Updates project details (description, category). Owner only.
    pub fn update_project(env: Env, project_id: u64, description: String, category: String) {
        let key = DataKey::Project(project_id);
        let mut project: Project = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::ProjectNotFound));

        project.owner.require_auth();
        project.description = description;
        project.category = category;
        env.storage().persistent().set(&key, &project);

        env.events().publish(
            (env.current_contract_address(), String::from_str(&env, "project_updated")),
            project_id,
        );
    }

    /// Returns the project details.
    pub fn get_project(env: Env, project_id: u64) -> Option<Project> {
        env.storage().persistent().get(&DataKey::Project(project_id))
    }

    /// Returns the project owner.
    pub fn get_project_owner(env: Env, project_id: u64) -> Address {
        let project: Project = env
            .storage()
            .persistent()
            .get(&DataKey::Project(project_id))
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::ProjectNotFound));
        project.owner
    }

    /// Checks if a project is verified.
    pub fn is_project_verified(env: Env, project_id: u64) -> bool {
        let project_opt: Option<Project> = env.storage().persistent().get(&DataKey::Project(project_id));
        match project_opt {
            Some(project) => project.verified,
            None => false,
        }
    }

    /// Upgrades the contract WASM code (Admin only).
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin = Self::get_admin(env.clone());
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    /// Helper to get the admin address.
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic_with_error!(&env, ErrorCode::NotInitialized))
    }

    /// Helper to get total projects count.
    pub fn get_project_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::ProjectCount).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
