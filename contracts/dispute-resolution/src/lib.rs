#![no_std]
extern crate alloc;

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeStatus {
    Open,
    UnderReview,
    Resolved,
    Escalated,
    Dismissed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeOutcome {
    BuyerWins,
    SellerWins,
    SplitSettlement,
    NoMerit,
}

/// Wrapper so Option<DisputeOutcome> is contracttype-safe
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum OptionalOutcome {
    None,
    Some(DisputeOutcome),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DisputeReason {
    ItemNotReceived,
    ItemNotAsDescribed,
    DamagedItem,
    WrongItem,
    SellerUnresponsive,
    FraudSuspected,
    Other,
}

// ──────────────────────────────────────────────
// Structs
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Dispute {
    pub dispute_id: String,
    pub deal_id: String,
    pub buyer: Address,
    pub seller: Address,
    pub amount: i128,
    pub reason: DisputeReason,
    pub description: String,
    pub status: DisputeStatus,
    pub outcome: OptionalOutcome,
    pub arbiter: Option<Address>,
    pub buyer_evidence: Vec<String>,
    pub seller_evidence: Vec<String>,
    pub resolution_note: Option<String>,
    pub buyer_split_pct: u32,
    pub seller_split_pct: u32,
    pub created_at: u64,
    pub resolved_at: Option<u64>,
}

// ──────────────────────────────────────────────
// Storage keys
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Dispute(String),         // dispute_id → Dispute
    DealDispute(String),     // deal_id   → dispute_id
    ArbiterPool,             // Vec<Address>
    BuyerDisputes(Address),  // buyer     → Vec<dispute_id>
    SellerDisputes(Address), // seller    → Vec<dispute_id>
    NextDisputeId,
}

// ──────────────────────────────────────────────
// Contract
// ──────────────────────────────────────────────

#[contract]
pub struct DisputeResolutionContract;

#[contractimpl]
impl DisputeResolutionContract {
    // ────────────── Initialization ──────────────

    /// Initialize the contract and set admin
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        // Initialize empty arbiter pool
        let pool: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::ArbiterPool, &pool);
    }

    // ────────────── Arbiter management ──────────────

    /// Add an arbiter to the pool (admin only)
    pub fn add_arbiter(env: Env, arbiter: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let mut pool: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::ArbiterPool)
            .unwrap_or(Vec::new(&env));

        // Check duplicate
        for existing in pool.iter() {
            if existing == arbiter {
                panic!("Arbiter already in pool");
            }
        }

        pool.push_back(arbiter.clone());
        env.storage().instance().set(&DataKey::ArbiterPool, &pool);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("arbiter")),
            arbiter,
        );
    }

    /// Get all arbiters
    pub fn get_arbiters(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::ArbiterPool)
            .unwrap_or(Vec::new(&env))
    }

    // ────────────── Dispute lifecycle ──────────────

    /// File a new dispute. Only buyer can file.
    pub fn file_dispute(
        env: Env,
        deal_id: String,
        buyer: Address,
        seller: Address,
        amount: i128,
        reason: DisputeReason,
        description: String,
    ) -> String {
        buyer.require_auth();

        if buyer == seller {
            panic!("Cannot dispute yourself");
        }
        if amount <= 0 {
            panic!("Dispute amount must be positive");
        }

        // Check for existing dispute on this deal
        if env.storage().instance().has(&DataKey::DealDispute(deal_id.clone())) {
            panic!("Dispute already exists for this deal");
        }

        // Generate dispute ID
        let next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextDisputeId)
            .unwrap_or(1);
        let dispute_id_str = alloc::format!("DISP-{}", next_id);
        let dispute_id = String::from_str(&env, &dispute_id_str);
        env.storage()
            .instance()
            .set(&DataKey::NextDisputeId, &(next_id + 1));

        let dispute = Dispute {
            dispute_id: dispute_id.clone(),
            deal_id: deal_id.clone(),
            buyer: buyer.clone(),
            seller: seller.clone(),
            amount,
            reason,
            description,
            status: DisputeStatus::Open,
            outcome: OptionalOutcome::None,
            arbiter: None,
            buyer_evidence: Vec::new(&env),
            seller_evidence: Vec::new(&env),
            resolution_note: None,
            buyer_split_pct: 0,
            seller_split_pct: 0,
            created_at: env.ledger().timestamp(),
            resolved_at: None,
        };

        // Store dispute
        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        // Map deal → dispute
        env.storage()
            .instance()
            .set(&DataKey::DealDispute(deal_id), &dispute_id);

        // Update buyer disputes index
        let mut buyer_disputes: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::BuyerDisputes(buyer.clone()))
            .unwrap_or(Vec::new(&env));
        buyer_disputes.push_back(dispute_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::BuyerDisputes(buyer), &buyer_disputes);

        // Update seller disputes index
        let mut seller_disputes: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerDisputes(seller.clone()))
            .unwrap_or(Vec::new(&env));
        seller_disputes.push_back(dispute_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::SellerDisputes(seller), &seller_disputes);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("filed")),
            dispute_id.clone(),
        );

        dispute_id
    }

    /// Assign an arbiter to a dispute (admin only)
    pub fn assign_arbiter(env: Env, dispute_id: String, arbiter: Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id.clone()))
            .unwrap_or_else(|| panic!("Dispute not found"));

        if dispute.status != DisputeStatus::Open {
            panic!("Can only assign arbiter to Open disputes");
        }

        // Verify arbiter is in pool
        let pool: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::ArbiterPool)
            .unwrap_or(Vec::new(&env));
        let mut found = false;
        for a in pool.iter() {
            if a == arbiter {
                found = true;
                break;
            }
        }
        if !found {
            panic!("Arbiter not in pool");
        }

        dispute.arbiter = Some(arbiter.clone());
        dispute.status = DisputeStatus::UnderReview;
        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("assigned")),
            dispute_id,
        );
    }

    /// Submit evidence for a dispute (buyer or seller)
    pub fn submit_evidence(
        env: Env,
        dispute_id: String,
        submitter: Address,
        evidence: String,
    ) {
        submitter.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id.clone()))
            .unwrap_or_else(|| panic!("Dispute not found"));

        if dispute.status == DisputeStatus::Resolved || dispute.status == DisputeStatus::Dismissed {
            panic!("Cannot submit evidence to a closed dispute");
        }

        if submitter == dispute.buyer {
            dispute.buyer_evidence.push_back(evidence);
        } else if submitter == dispute.seller {
            dispute.seller_evidence.push_back(evidence);
        } else {
            panic!("Only buyer or seller can submit evidence");
        }

        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("evidence")),
            dispute_id,
        );
    }

    /// Resolve the dispute – arbiter decides the outcome
    pub fn resolve_dispute(
        env: Env,
        dispute_id: String,
        arbiter: Address,
        outcome: DisputeOutcome,
        resolution_note: String,
        buyer_split_pct: u32,
        seller_split_pct: u32,
    ) {
        arbiter.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id.clone()))
            .unwrap_or_else(|| panic!("Dispute not found"));

        if dispute.status != DisputeStatus::UnderReview {
            panic!("Dispute must be UnderReview to resolve");
        }

        match &dispute.arbiter {
            Some(assigned) => {
                if *assigned != arbiter {
                    panic!("Only assigned arbiter can resolve");
                }
            }
            None => panic!("No arbiter assigned"),
        }

        // Validate split percentages for SplitSettlement
        if outcome == DisputeOutcome::SplitSettlement {
            if buyer_split_pct + seller_split_pct != 100 {
                panic!("Split percentages must sum to 100");
            }
        }

        dispute.status = DisputeStatus::Resolved;
        dispute.outcome = OptionalOutcome::Some(outcome.clone());
        dispute.resolution_note = Some(resolution_note);
        dispute.resolved_at = Some(env.ledger().timestamp());

        match &outcome {
            DisputeOutcome::BuyerWins => {
                dispute.buyer_split_pct = 100;
                dispute.seller_split_pct = 0;
            }
            DisputeOutcome::SellerWins => {
                dispute.buyer_split_pct = 0;
                dispute.seller_split_pct = 100;
            }
            DisputeOutcome::SplitSettlement => {
                dispute.buyer_split_pct = buyer_split_pct;
                dispute.seller_split_pct = seller_split_pct;
            }
            DisputeOutcome::NoMerit => {
                dispute.buyer_split_pct = 0;
                dispute.seller_split_pct = 100;
            }
        }

        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("resolved")),
            dispute_id,
        );
    }

    /// Escalate a dispute (admin only)
    pub fn escalate_dispute(env: Env, dispute_id: String) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id.clone()))
            .unwrap_or_else(|| panic!("Dispute not found"));

        if dispute.status == DisputeStatus::Resolved || dispute.status == DisputeStatus::Dismissed {
            panic!("Cannot escalate a closed dispute");
        }

        dispute.status = DisputeStatus::Escalated;
        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("escalated")),
            dispute_id,
        );
    }

    /// Dismiss a dispute (arbiter only)
    pub fn dismiss_dispute(env: Env, dispute_id: String, arbiter: Address, reason: String) {
        arbiter.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id.clone()))
            .unwrap_or_else(|| panic!("Dispute not found"));

        if dispute.status != DisputeStatus::UnderReview {
            panic!("Dispute must be UnderReview to dismiss");
        }

        match &dispute.arbiter {
            Some(assigned) => {
                if *assigned != arbiter {
                    panic!("Only assigned arbiter can dismiss");
                }
            }
            None => panic!("No arbiter assigned"),
        }

        dispute.status = DisputeStatus::Dismissed;
        dispute.outcome = OptionalOutcome::Some(DisputeOutcome::NoMerit);
        dispute.resolution_note = Some(reason);
        dispute.resolved_at = Some(env.ledger().timestamp());
        dispute.buyer_split_pct = 0;
        dispute.seller_split_pct = 100;

        env.storage()
            .instance()
            .set(&DataKey::Dispute(dispute_id.clone()), &dispute);

        env.events().publish(
            (symbol_short!("Dispute"), symbol_short!("dismiss")),
            dispute_id,
        );
    }

    // ────────────── Queries ──────────────

    /// Get dispute by ID
    pub fn get_dispute(env: Env, dispute_id: String) -> Dispute {
        env.storage()
            .instance()
            .get(&DataKey::Dispute(dispute_id))
            .unwrap_or_else(|| panic!("Dispute not found"))
    }

    /// Get dispute by deal ID
    pub fn get_dispute_by_deal(env: Env, deal_id: String) -> Option<Dispute> {
        let dispute_id: Option<String> = env
            .storage()
            .instance()
            .get(&DataKey::DealDispute(deal_id));

        match dispute_id {
            Some(did) => env.storage().instance().get(&DataKey::Dispute(did)),
            None => None,
        }
    }

    /// Get all disputes where the address is the buyer
    pub fn get_buyer_disputes(env: Env, buyer: Address) -> Vec<Dispute> {
        let ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::BuyerDisputes(buyer))
            .unwrap_or(Vec::new(&env));

        let mut disputes = Vec::new(&env);
        for id in ids.iter() {
            if let Some(d) = env.storage().instance().get(&DataKey::Dispute(id)) {
                disputes.push_back(d);
            }
        }
        disputes
    }

    /// Get all disputes where the address is the seller
    pub fn get_seller_disputes(env: Env, seller: Address) -> Vec<Dispute> {
        let ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerDisputes(seller))
            .unwrap_or(Vec::new(&env));

        let mut disputes = Vec::new(&env);
        for id in ids.iter() {
            if let Some(d) = env.storage().instance().get(&DataKey::Dispute(id)) {
                disputes.push_back(d);
            }
        }
        disputes
    }
}

mod test;
