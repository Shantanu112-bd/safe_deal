#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    testutils::Ledger as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

// ──────────────────────────────────────────────
// Test Helpers
// ──────────────────────────────────────────────

/// Set up test environment with mock auth
fn setup_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

/// Deploy a mock USDC token and return (token_address, admin)
fn deploy_token(env: &Env) -> (Address, Address) {
    let admin = Address::generate(env);
    let token_address = env.register_stellar_asset_contract_v2(admin.clone()).address().clone();
    (token_address, admin)
}

/// Initialize escrow contract with token
fn setup_escrow(env: &Env) -> (MerchantEscrowContractClient, Address, Address) {
    let contract_id = env.register_contract(None, MerchantEscrowContract);
    let client = MerchantEscrowContractClient::new(env, &contract_id);

    let (token_address, token_admin) = deploy_token(env);
    let admin = Address::generate(env);
    client.initialize(&admin, &token_address);

    (client, token_address, token_admin)
}

/// Mint USDC to an address
fn mint_usdc(env: &Env, token_address: &Address, token_admin: &Address, to: &Address, amount: i128) {
    let sac = StellarAssetClient::new(env, token_address);
    sac.mint(to, &amount);
}

/// Get USDC balance of an address
fn usdc_balance(env: &Env, token_address: &Address, who: &Address) -> i128 {
    let token = TokenClient::new(env, token_address);
    token.balance(who)
}

/// Helper to create a standard test deal (100 USDC = 100_000_000 stroops)
fn create_test_deal(
    env: &Env,
    client: &MerchantEscrowContractClient,
    seller: &Address,
) -> String {
    let desc = String::from_str(env, "iPhone 15 Pro");
    let item_name = String::from_str(env, "Phone");
    client.create_deal(seller, &100_000_000i128, &desc, &item_name, &48u64)
}

// ============================================================
// initialize tests
// ============================================================

#[test]
fn test_initialize() {
    let env = setup_env();
    let (client, token_address, _) = setup_escrow(&env);

    let stored_token = client.get_token();
    assert_eq!(stored_token, token_address);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_double_initialize() {
    let env = setup_env();
    let (client, token_address, _) = setup_escrow(&env);

    let admin2 = Address::generate(&env);
    client.initialize(&admin2, &token_address);
}

// ============================================================
// create_deal tests
// ============================================================

#[test]
fn test_create_deal() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let deal_id = create_test_deal(&env, &client, &seller);

    assert_eq!(deal_id, String::from_str(&env, "DEAL-1"));

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.seller, seller);
    assert_eq!(deal.amount, 100_000_000i128);
    assert_eq!(deal.status, DealStatus::WaitingForPayment);
    assert!(deal.buyer.is_none());
    assert!(deal.locked_at.is_none());

    // Verify seller deals updated
    let seller_deals = client.get_seller_deals(&seller);
    assert_eq!(seller_deals.len(), 1);
}

#[test]
fn test_create_multiple_deals_increments_id() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let deal1 = create_test_deal(&env, &client, &seller);
    let deal2 = create_test_deal(&env, &client, &seller);
    let deal3 = create_test_deal(&env, &client, &seller);

    assert_eq!(deal1, String::from_str(&env, "DEAL-1"));
    assert_eq!(deal2, String::from_str(&env, "DEAL-2"));
    assert_eq!(deal3, String::from_str(&env, "DEAL-3"));

    let seller_deals = client.get_seller_deals(&seller);
    assert_eq!(seller_deals.len(), 3);
}

#[test]
#[should_panic(expected = "Amount must be greater than zero")]
fn test_create_deal_zero_amount() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "iPhone 15 Pro");
    let item_name = String::from_str(&env, "Phone");
    client.create_deal(&seller, &0i128, &desc, &item_name, &48u64);
}

#[test]
#[should_panic(expected = "Amount must be greater than zero")]
fn test_create_deal_negative_amount() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "Test");
    let item_name = String::from_str(&env, "Item");
    client.create_deal(&seller, &-500i128, &desc, &item_name, &24u64);
}

#[test]
#[should_panic(expected = "Expiry hours must be greater than zero")]
fn test_create_deal_zero_expiry() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "Test");
    let item_name = String::from_str(&env, "Item");
    client.create_deal(&seller, &100i128, &desc, &item_name, &0u64);
}

// ============================================================
// lock_payment tests — with REAL USDC transfers
// ============================================================

#[test]
fn test_lock_payment_transfers_usdc() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 100_000_000; // 10 USDC in stroops

    // Mint USDC to buyer
    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);
    assert_eq!(usdc_balance(&env, &token_address, &buyer), deal_amount);

    // Create deal and lock payment
    let deal_id = create_test_deal(&env, &client, &seller);
    let success = client.lock_payment(&deal_id, &buyer, &deal_amount);
    assert!(success);

    // Verify USDC transferred: buyer → contract
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);
    let contract_addr = client.address.clone();
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), deal_amount);

    // Verify deal state
    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.buyer, Some(buyer.clone()));
    assert_eq!(deal.status, DealStatus::Locked);
    assert!(deal.locked_at.is_some());

    // Verify buyer deals updated
    let buyer_deals = client.get_buyer_deals(&buyer);
    assert_eq!(buyer_deals.len(), 1);
}

#[test]
fn test_lock_payment_wrong_amount() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    mint_usdc(&env, &token_address, &token_admin, &buyer, 200_000_000);

    let deal_id = create_test_deal(&env, &client, &seller);

    // Try to lock with wrong amount — should return false, no USDC moved
    let success = client.lock_payment(&deal_id, &buyer, &90_000_000i128);
    assert!(!success);

    // USDC should NOT have moved
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 200_000_000);

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::WaitingForPayment);
    assert!(deal.buyer.is_none());
}

#[test]
#[should_panic(expected = "Deal not found")]
fn test_lock_payment_nonexistent_deal() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let buyer = Address::generate(&env);
    let fake_deal = String::from_str(&env, "DEAL-999");
    client.lock_payment(&fake_deal, &buyer, &100i128);
}

// ============================================================
// confirm_delivery tests — with REAL USDC releases
// ============================================================

#[test]
fn test_confirm_delivery_releases_usdc_to_seller() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 100_000_000;

    // Mint USDC to buyer
    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);

    // Full flow: create → lock → confirm
    let deal_id = create_test_deal(&env, &client, &seller);
    client.lock_payment(&deal_id, &buyer, &deal_amount);
    client.confirm_delivery(&deal_id, &buyer);

    // Verify: USDC released to seller
    assert_eq!(usdc_balance(&env, &token_address, &seller), deal_amount);

    // Verify: escrow contract balance is zero
    let contract_addr = client.address.clone();
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), 0);

    // Verify: buyer has zero USDC
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);

    // Verify deal completed
    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Completed);
}

#[test]
#[should_panic(expected = "Deal is not locked")]
fn test_confirm_delivery_not_locked() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_id = create_test_deal(&env, &client, &seller);

    client.confirm_delivery(&deal_id, &buyer);
}

#[test]
#[should_panic(expected = "Only the buyer can confirm delivery")]
fn test_confirm_delivery_wrong_buyer() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let impostor = Address::generate(&env);
    let deal_amount: i128 = 100_000_000;

    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);

    let deal_id = create_test_deal(&env, &client, &seller);
    client.lock_payment(&deal_id, &buyer, &deal_amount);

    // Impostor tries to confirm — should panic
    client.confirm_delivery(&deal_id, &impostor);
}

// ============================================================
// auto_refund tests — with REAL USDC refunds
// ============================================================

#[test]
fn test_auto_refund_returns_usdc_to_buyer() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 100_000_000;

    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);

    let deal_id = create_test_deal(&env, &client, &seller);
    client.lock_payment(&deal_id, &buyer, &deal_amount);

    // Buyer has 0 USDC, contract holds it
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);

    // Fast forward past expiry
    let deal = client.get_deal(&deal_id);
    env.ledger().set_timestamp(deal.expiry_at + 1);

    client.auto_refund(&deal_id);

    // Verify: USDC returned to buyer
    assert_eq!(usdc_balance(&env, &token_address, &buyer), deal_amount);

    // Verify: escrow is empty
    let contract_addr = client.address.clone();
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), 0);

    // Verify: seller got nothing
    assert_eq!(usdc_balance(&env, &token_address, &seller), 0);

    let final_deal = client.get_deal(&deal_id);
    assert_eq!(final_deal.status, DealStatus::Refunded);
}

#[test]
#[should_panic(expected = "Deal has not expired yet")]
fn test_auto_refund_too_early() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);

    mint_usdc(&env, &token_address, &token_admin, &buyer, 100_000_000);

    let deal_id = create_test_deal(&env, &client, &seller);
    client.lock_payment(&deal_id, &buyer, &100_000_000i128);

    // Does not advance the clock — refund too early
    client.auto_refund(&deal_id);
}

#[test]
#[should_panic(expected = "Deal is not locked")]
fn test_auto_refund_not_locked() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let deal_id = create_test_deal(&env, &client, &seller);

    env.ledger().set_timestamp(999_999_999);
    client.auto_refund(&deal_id);
}

// ============================================================
// cancel_deal tests — including refund on locked deals
// ============================================================

#[test]
fn test_cancel_deal_waiting() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let deal_id = create_test_deal(&env, &client, &seller);

    client.cancel_deal(&deal_id, &seller);

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Cancelled);
}

#[test]
fn test_cancel_locked_deal_refunds_buyer() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 100_000_000;

    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);

    let deal_id = create_test_deal(&env, &client, &seller);
    client.lock_payment(&deal_id, &buyer, &deal_amount);

    // Buyer's USDC is in escrow
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);

    // Seller cancels a locked deal → buyer should be refunded
    client.cancel_deal(&deal_id, &seller);

    // Buyer gets USDC back
    assert_eq!(usdc_balance(&env, &token_address, &buyer), deal_amount);

    // Escrow is empty
    let contract_addr = client.address.clone();
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), 0);

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Cancelled);
}

#[test]
#[should_panic(expected = "Only the seller can cancel")]
fn test_cancel_deal_wrong_seller() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let impostor = Address::generate(&env);
    let deal_id = create_test_deal(&env, &client, &seller);

    client.cancel_deal(&deal_id, &impostor);
}

// ============================================================
// Full lifecycle tests
// ============================================================

#[test]
fn test_full_deal_lifecycle_with_real_usdc() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 50_000_000; // 5 USDC
    let contract_addr = client.address.clone();

    // Fund buyer with USDC
    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);
    assert_eq!(usdc_balance(&env, &token_address, &buyer), deal_amount);
    assert_eq!(usdc_balance(&env, &token_address, &seller), 0);

    // 1. Create deal
    let desc = String::from_str(&env, "Custom Art Commission");
    let item_name = String::from_str(&env, "Art");
    let deal_id = client.create_deal(&seller, &deal_amount, &desc, &item_name, &24u64);
    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::WaitingForPayment);

    // 2. Lock payment — USDC moves buyer → escrow
    let ok = client.lock_payment(&deal_id, &buyer, &deal_amount);
    assert!(ok);
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), deal_amount);
    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Locked);

    // 3. Confirm delivery — USDC moves escrow → seller
    client.confirm_delivery(&deal_id, &buyer);
    assert_eq!(usdc_balance(&env, &token_address, &seller), deal_amount);
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), 0);
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Completed);

    // Verify both seller and buyer see the deal
    assert_eq!(client.get_seller_deals(&seller).len(), 1);
    assert_eq!(client.get_buyer_deals(&buyer).len(), 1);
}

#[test]
fn test_full_refund_lifecycle_with_real_usdc() {
    let env = setup_env();
    let (client, token_address, token_admin) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let buyer = Address::generate(&env);
    let deal_amount: i128 = 75_000_000; // 7.5 USDC
    let contract_addr = client.address.clone();

    // Fund buyer
    mint_usdc(&env, &token_address, &token_admin, &buyer, deal_amount);

    // Create & lock
    let desc = String::from_str(&env, "Custom Watch");
    let item_name = String::from_str(&env, "Watch");
    let deal_id = client.create_deal(&seller, &deal_amount, &desc, &item_name, &12u64);
    client.lock_payment(&deal_id, &buyer, &deal_amount);

    // USDC is in escrow
    assert_eq!(usdc_balance(&env, &token_address, &buyer), 0);
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), deal_amount);

    // Fast forward past expiry
    let deal = client.get_deal(&deal_id);
    env.ledger().set_timestamp(deal.expiry_at + 1);

    // Auto refund → USDC returns to buyer
    client.auto_refund(&deal_id);

    assert_eq!(usdc_balance(&env, &token_address, &buyer), deal_amount);
    assert_eq!(usdc_balance(&env, &token_address, &contract_addr), 0);
    assert_eq!(usdc_balance(&env, &token_address, &seller), 0);

    let deal = client.get_deal(&deal_id);
    assert_eq!(deal.status, DealStatus::Refunded);
}

// ============================================================
// Query tests
// ============================================================

#[test]
#[should_panic(expected = "Deal not found")]
fn test_get_deal_not_found() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let fake_deal = String::from_str(&env, "DEAL-999");
    client.get_deal(&fake_deal);
}

#[test]
fn test_get_seller_deals_empty() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let seller = Address::generate(&env);
    let deals = client.get_seller_deals(&seller);
    assert_eq!(deals.len(), 0);
}

#[test]
fn test_get_buyer_deals_empty() {
    let env = setup_env();
    let (client, _, _) = setup_escrow(&env);

    let buyer = Address::generate(&env);
    let deals = client.get_buyer_deals(&buyer);
    assert_eq!(deals.len(), 0);
}
