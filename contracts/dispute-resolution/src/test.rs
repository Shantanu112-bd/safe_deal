#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

fn init_contract(env: &Env) -> (DisputeResolutionContractClient, Address) {
    let contract_id = env.register_contract(None, DisputeResolutionContract);
    let client = DisputeResolutionContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    client.initialize(&admin);
    (client, admin)
}

fn setup_with_arbiter(env: &Env) -> (DisputeResolutionContractClient, Address, Address) {
    let (client, admin) = init_contract(env);
    let arbiter = Address::generate(env);
    client.add_arbiter(&arbiter);
    (client, admin, arbiter)
}

fn file_test_dispute(
    client: &DisputeResolutionContractClient,
    env: &Env,
) -> (String, Address, Address) {
    let buyer = Address::generate(env);
    let seller = Address::generate(env);
    let deal_id = String::from_str(env, "DEAL-1");
    let description = String::from_str(env, "Item not received");

    let dispute_id = client.file_dispute(
        &deal_id,
        &buyer,
        &seller,
        &1_000_000i128,
        &DisputeReason::ItemNotReceived,
        &description,
    );
    (dispute_id, buyer, seller)
}

// ============================================================
// initialize tests
// ============================================================

#[test]
fn test_initialize() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let _ = client;
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_initialize_twice() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let another = Address::generate(&env);
    client.initialize(&another);
}

// ============================================================
// arbiter management tests
// ============================================================

#[test]
fn test_add_arbiter() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let arbiter = Address::generate(&env);

    client.add_arbiter(&arbiter);
    let pool = client.get_arbiters();
    assert_eq!(pool.len(), 1);
}

#[test]
#[should_panic(expected = "Arbiter already in pool")]
fn test_add_arbiter_duplicate() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let arbiter = Address::generate(&env);

    client.add_arbiter(&arbiter);
    client.add_arbiter(&arbiter);
}

#[test]
fn test_add_multiple_arbiters() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    for _ in 0..3 {
        let arb = Address::generate(&env);
        client.add_arbiter(&arb);
    }
    assert_eq!(client.get_arbiters().len(), 3);
}

// ============================================================
// file_dispute tests
// ============================================================

#[test]
fn test_file_dispute() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, buyer, seller) = file_test_dispute(&client, &env);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Open);
    assert_eq!(d.buyer, buyer);
    assert_eq!(d.seller, seller);
    assert_eq!(d.amount, 1_000_000);
    assert_eq!(d.reason, DisputeReason::ItemNotReceived);
    assert_eq!(d.outcome, OptionalOutcome::None);
    assert!(d.arbiter.is_none());
}

#[test]
#[should_panic(expected = "Cannot dispute yourself")]
fn test_file_dispute_self() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let user = Address::generate(&env);
    let deal_id = String::from_str(&env, "DEAL-1");
    let desc = String::from_str(&env, "Self dispute");

    client.file_dispute(
        &deal_id,
        &user,
        &user,
        &1_000_000i128,
        &DisputeReason::Other,
        &desc,
    );
}

#[test]
#[should_panic(expected = "Dispute amount must be positive")]
fn test_file_dispute_zero_amount() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let deal_id = String::from_str(&env, "DEAL-1");
    let desc = String::from_str(&env, "Zero amount");

    client.file_dispute(
        &deal_id,
        &buyer,
        &seller,
        &0i128,
        &DisputeReason::Other,
        &desc,
    );
}

#[test]
#[should_panic(expected = "Dispute already exists for this deal")]
fn test_file_dispute_duplicate_deal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let deal_id = String::from_str(&env, "DEAL-1");
    let desc = String::from_str(&env, "First");

    client.file_dispute(
        &deal_id,
        &buyer,
        &seller,
        &1_000_000i128,
        &DisputeReason::ItemNotReceived,
        &desc,
    );

    let desc2 = String::from_str(&env, "Second");
    client.file_dispute(
        &deal_id,
        &buyer,
        &seller,
        &1_000_000i128,
        &DisputeReason::ItemNotReceived,
        &desc2,
    );
}

#[test]
fn test_file_dispute_increments_id() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "Test");

    let id1 = client.file_dispute(
        &String::from_str(&env, "DEAL-1"),
        &buyer,
        &seller,
        &100i128,
        &DisputeReason::Other,
        &desc,
    );
    let id2 = client.file_dispute(
        &String::from_str(&env, "DEAL-2"),
        &buyer,
        &seller,
        &200i128,
        &DisputeReason::Other,
        &desc,
    );

    assert_eq!(id1, String::from_str(&env, "DISP-1"));
    assert_eq!(id2, String::from_str(&env, "DISP-2"));
}

// ============================================================
// assign_arbiter tests
// ============================================================

#[test]
fn test_assign_arbiter() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::UnderReview);
    assert_eq!(d.arbiter, Some(arbiter));
}

#[test]
#[should_panic(expected = "Arbiter not in pool")]
fn test_assign_arbiter_not_in_pool() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);
    let random = Address::generate(&env);

    client.assign_arbiter(&dispute_id, &random);
}

#[test]
#[should_panic(expected = "Can only assign arbiter to Open disputes")]
fn test_assign_arbiter_wrong_status() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    // Assign once → UnderReview
    client.assign_arbiter(&dispute_id, &arbiter);
    // Try assigning again
    client.assign_arbiter(&dispute_id, &arbiter);
}

// ============================================================
// submit_evidence tests
// ============================================================

#[test]
fn test_submit_buyer_evidence() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, buyer, _seller) = file_test_dispute(&client, &env);

    let evidence = String::from_str(&env, "Screenshot of conversation");
    client.submit_evidence(&dispute_id, &buyer, &evidence);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.buyer_evidence.len(), 1);
}

#[test]
fn test_submit_seller_evidence() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, _buyer, seller) = file_test_dispute(&client, &env);

    let evidence = String::from_str(&env, "Shipping receipt");
    client.submit_evidence(&dispute_id, &seller, &evidence);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.seller_evidence.len(), 1);
}

#[test]
#[should_panic(expected = "Only buyer or seller can submit evidence")]
fn test_submit_evidence_third_party() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);
    let random = Address::generate(&env);

    let evidence = String::from_str(&env, "Random evidence");
    client.submit_evidence(&dispute_id, &random, &evidence);
}

#[test]
fn test_submit_multiple_evidence() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, buyer, seller) = file_test_dispute(&client, &env);

    for i in 0..3 {
        let e_str = alloc::format!("Buyer evidence {}", i);
        let evidence = String::from_str(&env, &e_str);
        client.submit_evidence(&dispute_id, &buyer, &evidence);
    }
    for i in 0..2 {
        let e_str = alloc::format!("Seller evidence {}", i);
        let evidence = String::from_str(&env, &e_str);
        client.submit_evidence(&dispute_id, &seller, &evidence);
    }

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.buyer_evidence.len(), 3);
    assert_eq!(d.seller_evidence.len(), 2);
}

// ============================================================
// resolve_dispute tests
// ============================================================

#[test]
fn test_resolve_buyer_wins() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Buyer is correct");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::BuyerWins,
        &note,
        &0,
        &0,
    );

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Resolved);
    assert_eq!(d.outcome, OptionalOutcome::Some(DisputeOutcome::BuyerWins));
    assert_eq!(d.buyer_split_pct, 100);
    assert_eq!(d.seller_split_pct, 0);
    assert!(d.resolved_at.is_some());
}

#[test]
fn test_resolve_seller_wins() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Seller is correct");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::SellerWins,
        &note,
        &0,
        &0,
    );

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Resolved);
    assert_eq!(d.outcome, OptionalOutcome::Some(DisputeOutcome::SellerWins));
    assert_eq!(d.buyer_split_pct, 0);
    assert_eq!(d.seller_split_pct, 100);
}

#[test]
fn test_resolve_split_settlement() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Both have some merit");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::SplitSettlement,
        &note,
        &60,
        &40,
    );

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Resolved);
    assert_eq!(d.outcome, OptionalOutcome::Some(DisputeOutcome::SplitSettlement));
    assert_eq!(d.buyer_split_pct, 60);
    assert_eq!(d.seller_split_pct, 40);
}

#[test]
#[should_panic(expected = "Split percentages must sum to 100")]
fn test_resolve_split_bad_percentages() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Bad split");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::SplitSettlement,
        &note,
        &30,
        &40,
    );
}

#[test]
#[should_panic(expected = "Dispute must be UnderReview to resolve")]
fn test_resolve_open_dispute() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);
    // Don't assign arbiter, so it's still Open
    let note = String::from_str(&env, "Attempt");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::BuyerWins,
        &note,
        &0,
        &0,
    );
}

#[test]
#[should_panic(expected = "Only assigned arbiter can resolve")]
fn test_resolve_wrong_arbiter() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);

    let wrong_arbiter = Address::generate(&env);
    let note = String::from_str(&env, "Wrong person");
    client.resolve_dispute(
        &dispute_id,
        &wrong_arbiter,
        &DisputeOutcome::BuyerWins,
        &note,
        &0,
        &0,
    );
}

// ============================================================
// escalate_dispute tests
// ============================================================

#[test]
fn test_escalate_dispute() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.escalate_dispute(&dispute_id);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Escalated);
}

#[test]
#[should_panic(expected = "Cannot escalate a closed dispute")]
fn test_escalate_resolved_dispute() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Done");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::BuyerWins,
        &note,
        &0,
        &0,
    );

    // Try to escalate
    client.escalate_dispute(&dispute_id);
}

// ============================================================
// dismiss_dispute tests
// ============================================================

#[test]
fn test_dismiss_dispute() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let reason = String::from_str(&env, "No merit");
    client.dismiss_dispute(&dispute_id, &arbiter, &reason);

    let d = client.get_dispute(&dispute_id);
    assert_eq!(d.status, DisputeStatus::Dismissed);
    assert_eq!(d.outcome, OptionalOutcome::Some(DisputeOutcome::NoMerit));
    assert_eq!(d.seller_split_pct, 100);
    assert_eq!(d.buyer_split_pct, 0);
}

#[test]
#[should_panic(expected = "Only assigned arbiter can dismiss")]
fn test_dismiss_wrong_arbiter() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let wrong = Address::generate(&env);
    let reason = String::from_str(&env, "N/A");
    client.dismiss_dispute(&dispute_id, &wrong, &reason);
}

// ============================================================
// Query tests
// ============================================================

#[test]
fn test_get_dispute_by_deal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let (dispute_id, _buyer, _seller) = file_test_dispute(&client, &env);

    let deal_id = String::from_str(&env, "DEAL-1");
    let result = client.get_dispute_by_deal(&deal_id);
    assert!(result.is_some());
    assert_eq!(result.unwrap().dispute_id, dispute_id);
}

#[test]
fn test_get_dispute_by_deal_none() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let deal_id = String::from_str(&env, "DEAL-999");
    let result = client.get_dispute_by_deal(&deal_id);
    assert!(result.is_none());
}

#[test]
fn test_get_buyer_disputes() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "Test");

    client.file_dispute(
        &String::from_str(&env, "DEAL-A"),
        &buyer,
        &seller,
        &100i128,
        &DisputeReason::ItemNotReceived,
        &desc,
    );
    client.file_dispute(
        &String::from_str(&env, "DEAL-B"),
        &buyer,
        &seller,
        &200i128,
        &DisputeReason::DamagedItem,
        &desc,
    );

    let disputes = client.get_buyer_disputes(&buyer);
    assert_eq!(disputes.len(), 2);
}

#[test]
fn test_get_seller_disputes() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let buyer = Address::generate(&env);
    let seller = Address::generate(&env);
    let desc = String::from_str(&env, "Test");

    client.file_dispute(
        &String::from_str(&env, "DEAL-A"),
        &buyer,
        &seller,
        &100i128,
        &DisputeReason::ItemNotReceived,
        &desc,
    );

    let disputes = client.get_seller_disputes(&seller);
    assert_eq!(disputes.len(), 1);
}

// ============================================================
// Evidence on closed dispute
// ============================================================

#[test]
#[should_panic(expected = "Cannot submit evidence to a closed dispute")]
fn test_submit_evidence_after_resolve() {
    let env = setup_env();
    let (client, _admin, arbiter) = setup_with_arbiter(&env);
    let (dispute_id, buyer, _seller) = file_test_dispute(&client, &env);

    client.assign_arbiter(&dispute_id, &arbiter);
    let note = String::from_str(&env, "Done");
    client.resolve_dispute(
        &dispute_id,
        &arbiter,
        &DisputeOutcome::BuyerWins,
        &note,
        &0,
        &0,
    );

    let evidence = String::from_str(&env, "Too late");
    client.submit_evidence(&dispute_id, &buyer, &evidence);
}
