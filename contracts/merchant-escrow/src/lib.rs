#![no_std]
extern crate alloc;

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

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

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Deal(String),
    SellerDeals(Address),
    BuyerDeals(Address),
    NextDealId,
}

#[contract]
pub struct MerchantEscrowContract;

#[contractimpl]
impl MerchantEscrowContract {
    /// Creates a new escrow deal
    /// Returns the unique deal_id
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

        // Generate deal ID using a simple counter for now
        let next_id: u64 = env.storage().instance().get(&DataKey::NextDealId).unwrap_or(1);
        
        let deal_id_str = alloc::format!("DEAL-{}", next_id);
        let deal_id = String::from_str(&env, &deal_id_str);
        
        
        env.storage().instance().set(&DataKey::NextDealId, &(next_id + 1));

        let current_time = env.ledger().timestamp();
        // Convert expiry hours to seconds
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
        env.storage().instance().set(&DataKey::Deal(deal_id.clone()), &deal);

        // Update seller deals
        let mut seller_deals: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerDeals(seller.clone()))
            .unwrap_or(Vec::new(&env));
        seller_deals.push_back(deal_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::SellerDeals(seller.clone()), &seller_deals);

        // Emit created event
        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("created")), deal_id.clone());

        deal_id
    }

    /// Buyer locks USDC into escrow vault
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

        // In a real implementation, this would interact with a token contract to transfer the funds to this contract's address
        // For example:
        // let token = token::Client::new(&env, &token_address);
        // token.transfer(&buyer, &env.current_contract_address(), &amount);

        deal.buyer = Some(buyer.clone());
        deal.status = DealStatus::Locked;
        deal.locked_at = Some(env.ledger().timestamp());

        // Update the deal
        env.storage().instance().set(&DataKey::Deal(deal_id.clone()), &deal);

        // Update buyer deals
        let mut buyer_deals: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::BuyerDeals(buyer.clone()))
            .unwrap_or(Vec::new(&env));
        buyer_deals.push_back(deal_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::BuyerDeals(buyer), &buyer_deals);

        // Emit locked event
        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("locked")), deal_id);

        true
    }

    /// Buyer confirms they received the item, releasing USDC
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

        // Real implementation: Release funds to seller
        // let token = token::Client::new(&env, &token_address);
        // token.transfer(&env.current_contract_address(), &deal.seller, &deal.amount);

        deal.status = DealStatus::Completed;
        env.storage().instance().set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("completed")), deal_id);
    }

    /// Auto refund if expiry time passed
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

        // Real implementation: Refund buyer
        // let buyer = deal.buyer.clone().unwrap();
        // let token = token::Client::new(&env, &token_address);
        // token.transfer(&env.current_contract_address(), &buyer, &deal.amount);

        deal.status = DealStatus::Refunded;
        env.storage().instance().set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("refunded")), deal_id);
    }

    /// Cancel a deal before payment
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

        if deal.status != DealStatus::WaitingForPayment {
            panic!("Only WaitingForPayment deals can be cancelled");
        }

        deal.status = DealStatus::Cancelled;
        env.storage().instance().set(&DataKey::Deal(deal_id.clone()), &deal);

        env.events()
            .publish((symbol_short!("Deal"), symbol_short!("cancelled")), deal_id);
    }

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
