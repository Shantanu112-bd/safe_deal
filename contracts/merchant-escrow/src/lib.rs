#![no_std]
extern crate alloc;

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Vec,
};

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DealStatus {
    WaitingForPayment,
    Locked,
    Completed,
    Disputed,
    Refunded,
    Cancelled,
    Expired,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Deal {
    pub deal_id: String,
    pub seller: Address,
    pub buyer: Option<Address>,
    pub amount: i128,
    pub description: String,
    pub item_name: String,
    pub status: DealStatus,
    pub created_at: u64,
    pub expiry_at: u64,
    pub locked_at: Option<u64>,
}

// ──────────────────────────────────────────────
// Storage keys
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TokenAddress,
    Deal(String),
    SellerDeals(Address),
    BuyerDeals(Address),
    NextDealId,
}

// ──────────────────────────────────────────────
// Contract
// ──────────────────────────────────────────────

#[contract]
pub struct MerchantEscrowContract;

#[contractimpl]
impl MerchantEscrowContract {
    // ────────────── Initialization ──────────────

    /// Initialize the contract with admin and USDC token address.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address, token_address: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenAddress, &token_address);

        env.events()
            .publish((symbol_short!("Escrow"), symbol_short!("init")), admin);
    }

    /// Get the stored USDC token address
    pub fn get_token(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"))
    }

    // ────────────── Deal lifecycle ──────────────

    /// Creates a new escrow deal.
    /// Returns the unique deal_id.
    pub fn create_deal(
        env: Env,
        seller: Address,
        amount: i128,
        description: String,
        item_name: String,
        expiry_hours: u64,
    ) -> String {
        seller.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than zero");
        }
        if expiry_hours == 0 {
            panic!("Expiry hours must be greater than zero");
        }

        // Generate deal ID using a simple counter
        let next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextDealId)
            .unwrap_or(1);

        let deal_id_str = alloc::format!("DEAL-{}", next_id);
        let deal_id = String::from_str(&env, &deal_id_str);

        env.storage()
            .instance()
            .set(&DataKey::NextDealId, &(next_id + 1));

        let current_time = env.ledger().timestamp();
        let expiry_at = current_time + (expiry_hours * 3600);

        let deal = Deal {
            deal_id: deal_id.clone(),
            seller: seller.clone(),
            buyer: None,
            amount,
            description,
            item_name,
            status: DealStatus::WaitingForPayment,
            created_at: current_time,
            expiry_at,
            locked_at: None,
        };

        // Store the deal
        env.storage()
            .instance()
            .set(&DataKey::Deal(deal_id.clone()), &deal);

        // Update seller deals index
        let mut seller_deals: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerDeals(seller.clone()))
            .unwrap_or(Vec::new(&env));
        seller_deals.push_back(deal_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::SellerDeals(seller), &seller_deals);

        // Emit created event
        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("created")), deal_id.clone());

        deal_id
    }

    /// Buyer locks USDC into escrow vault.
    /// REAL token transfer: buyer → contract address.
    pub fn lock_payment(env: Env, deal_id: String, buyer: Address, amount: i128) -> bool {
        buyer.require_auth();

        let mut deal: Deal = env
            .storage()
            .instance()
            .get(&DataKey::Deal(deal_id.clone()))
            .unwrap_or_else(|| panic!("Deal not found"));

        if deal.status != DealStatus::WaitingForPayment {
            panic!("Deal is not waiting for payment");
        }

        if amount != deal.amount {
            return false;
        }

        // ── REAL USDC TRANSFER: buyer → escrow contract ──
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&buyer, &env.current_contract_address(), &amount);

        // Update deal state
        deal.buyer = Some(buyer.clone());
        deal.status = DealStatus::Locked;
        deal.locked_at = Some(env.ledger().timestamp());

        env.storage()
            .instance()
            .set(&DataKey::Deal(deal_id.clone()), &deal);

        // Update buyer deals index
        let mut buyer_deals: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::BuyerDeals(buyer.clone()))
            .unwrap_or(Vec::new(&env));
        buyer_deals.push_back(deal_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::BuyerDeals(buyer), &buyer_deals);

        // Emit event with amount
        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("locked")), (deal_id, amount));

        true
    }

    /// Buyer confirms delivery — USDC released from contract to seller.
    pub fn confirm_delivery(env: Env, deal_id: String, buyer: Address) {
        buyer.require_auth();

        let mut deal: Deal = env
            .storage()
            .instance()
            .get(&DataKey::Deal(deal_id.clone()))
            .unwrap_or_else(|| panic!("Deal not found"));

        if deal.status != DealStatus::Locked {
            panic!("Deal is not locked");
        }

        if deal.buyer != Some(buyer) {
            panic!("Only the buyer can confirm delivery");
        }

        // ── REAL USDC TRANSFER: escrow contract → seller ──
        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &deal.seller,
            &deal.amount,
        );

        deal.status = DealStatus::Completed;
        env.storage()
            .instance()
            .set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events().publish(
            (symbol_short!("Deal"), symbol_short!("released")),
            (deal_id, deal.amount),
        );
    }

    /// Auto refund if expiry time passed — USDC returned from contract to buyer.
    pub fn auto_refund(env: Env, deal_id: String) {
        let mut deal: Deal = env
            .storage()
            .instance()
            .get(&DataKey::Deal(deal_id.clone()))
            .unwrap_or_else(|| panic!("Deal not found"));

        if deal.status != DealStatus::Locked {
            panic!("Deal is not locked");
        }

        if env.ledger().timestamp() < deal.expiry_at {
            panic!("Deal has not expired yet");
        }

        // ── REAL USDC TRANSFER: escrow contract → buyer ──
        let buyer = deal.buyer.clone().unwrap_or_else(|| panic!("No buyer found"));

        let token_address: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap_or_else(|| panic!("Contract not initialized"));

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &buyer, &deal.amount);

        deal.status = DealStatus::Refunded;
        env.storage()
            .instance()
            .set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events().publish(
            (symbol_short!("Deal"), symbol_short!("refunded")),
            (deal_id, deal.amount),
        );
    }

    /// Cancel a deal. If payment was locked, refund USDC to buyer.
    pub fn cancel_deal(env: Env, deal_id: String, seller: Address) {
        seller.require_auth();

        let mut deal: Deal = env
            .storage()
            .instance()
            .get(&DataKey::Deal(deal_id.clone()))
            .unwrap_or_else(|| panic!("Deal not found"));

        if deal.seller != seller {
            panic!("Only the seller can cancel");
        }

        // Allow cancellation of WaitingForPayment or Locked deals
        if deal.status != DealStatus::WaitingForPayment && deal.status != DealStatus::Locked {
            panic!("Deal cannot be cancelled in current status");
        }

        // If payment was already locked, refund the buyer
        if deal.status == DealStatus::Locked {
            let buyer = deal
                .buyer
                .clone()
                .unwrap_or_else(|| panic!("No buyer found"));

            let token_address: Address = env
                .storage()
                .instance()
                .get(&DataKey::TokenAddress)
                .unwrap_or_else(|| panic!("Contract not initialized"));

            let token_client = token::Client::new(&env, &token_address);
            token_client.transfer(&env.current_contract_address(), &buyer, &deal.amount);
        }

        deal.status = DealStatus::Cancelled;
        env.storage()
            .instance()
            .set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("cancel")), deal_id);
    }

    // ────────────── Queries ──────────────

    /// Read full deal details
    pub fn get_deal(env: Env, deal_id: String) -> Deal {
        env.storage()
            .instance()
            .get(&DataKey::Deal(deal_id))
            .unwrap_or_else(|| panic!("Deal not found"))
    }

    /// Read all deals for a seller
    pub fn get_seller_deals(env: Env, seller: Address) -> Vec<Deal> {
        let deal_ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerDeals(seller))
            .unwrap_or(Vec::new(&env));

        let mut deals = Vec::new(&env);
        for id in deal_ids.iter() {
            if let Some(deal) = env.storage().instance().get(&DataKey::Deal(id)) {
                deals.push_back(deal);
            }
        }
        deals
    }

    /// Read all deals for a buyer
    pub fn get_buyer_deals(env: Env, buyer: Address) -> Vec<Deal> {
        let deal_ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::BuyerDeals(buyer))
            .unwrap_or(Vec::new(&env));

        let mut deals = Vec::new(&env);
        for id in deal_ids.iter() {
            if let Some(deal) = env.storage().instance().get(&DataKey::Deal(id)) {
                deals.push_back(deal);
            }
        }
        deals
    }
}

mod test;
