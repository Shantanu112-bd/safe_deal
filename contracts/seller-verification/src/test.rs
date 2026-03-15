#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

fn setup_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

fn init_contract(env: &Env) -> (SellerVerificationContractClient, Address) {
    let contract_id = env.register_contract(None, SellerVerificationContract);
    let client = SellerVerificationContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    client.initialize(&admin);
    (client, admin)
}

fn register_test_seller(
    client: &SellerVerificationContractClient,
    env: &Env,
) -> Address {
    let seller = Address::generate(env);
    client.register_seller(
        &seller,
        &String::from_str(env, "TestShop"),
        &String::from_str(env, "Electronics"),
        &String::from_str(env, "WhatsApp"),
    );
    seller
}

// ============================================================
// initialize tests
// ============================================================

#[test]
fn test_initialize() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    // Initialized successfully – all-sellers list is empty
    assert_eq!(client.get_all_sellers().len(), 0);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_initialize_twice() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let another_admin = Address::generate(&env);
    client.initialize(&another_admin);
}

// ============================================================
// register_seller tests
// ============================================================

#[test]
fn test_register_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.seller, seller);
    assert_eq!(profile.status, VerificationStatus::Pending);
    assert_eq!(profile.badge, TrustBadge::NewSeller);
    assert_eq!(profile.completed_deals, 0);
    assert_eq!(profile.total_volume, 0);
    assert_eq!(profile.avg_rating, 0);
    assert_eq!(profile.total_ratings, 0);
    assert!(profile.verified_at.is_none());
    assert!(profile.metadata_uri.is_none());
}

#[test]
fn test_register_seller_appears_in_all_sellers() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    assert_eq!(client.get_all_sellers().len(), 0);
    let seller = register_test_seller(&client, &env);
    let all = client.get_all_sellers();
    assert_eq!(all.len(), 1);
    assert_eq!(all.get(0).unwrap(), seller);
}

#[test]
fn test_register_multiple_sellers() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    for _ in 0..5 {
        register_test_seller(&client, &env);
    }
    assert_eq!(client.get_all_sellers().len(), 5);
}

#[test]
#[should_panic(expected = "Seller already registered")]
fn test_register_seller_twice() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = Address::generate(&env);

    client.register_seller(
        &seller,
        &String::from_str(&env, "Shop1"),
        &String::from_str(&env, "Clothing"),
        &String::from_str(&env, "Instagram"),
    );
    // Second registration with same address should panic
    client.register_seller(
        &seller,
        &String::from_str(&env, "Shop2"),
        &String::from_str(&env, "Electronics"),
        &String::from_str(&env, "Telegram"),
    );
}

// ============================================================
// verify_seller tests
// ============================================================

#[test]
fn test_verify_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.verify_seller(&seller);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.status, VerificationStatus::Verified);
    assert!(profile.verified_at.is_some());
}

#[test]
fn test_is_verified_true() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    assert!(!client.is_verified(&seller));
    client.verify_seller(&seller);
    assert!(client.is_verified(&seller));
}

#[test]
fn test_is_verified_unregistered_returns_false() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    assert!(!client.is_verified(&random));
}

#[test]
#[should_panic(expected = "Seller already verified")]
fn test_verify_seller_twice() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.verify_seller(&seller);
    client.verify_seller(&seller); // should panic
}

#[test]
#[should_panic(expected = "Seller not found")]
fn test_verify_nonexistent_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    client.verify_seller(&random);
}

// ============================================================
// reject_seller tests
// ============================================================

#[test]
fn test_reject_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.reject_seller(&seller);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.status, VerificationStatus::Rejected);
}

#[test]
#[should_panic(expected = "Seller not found")]
fn test_reject_nonexistent_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    client.reject_seller(&random);
}

// ============================================================
// suspend_seller tests
// ============================================================

#[test]
fn test_suspend_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.verify_seller(&seller);
    client.suspend_seller(&seller);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.status, VerificationStatus::Suspended);
}

#[test]
#[should_panic(expected = "Seller not found")]
fn test_suspend_nonexistent_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    client.suspend_seller(&random);
}

// ============================================================
// record_completed_deal tests
// ============================================================

#[test]
fn test_record_completed_deal_increments_counter() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.record_completed_deal(&seller, &500_000i128);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.completed_deals, 1);
    assert_eq!(profile.total_volume, 500_000);
}

#[test]
fn test_record_multiple_deals_accumulates_volume() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for _ in 0..5 {
        client.record_completed_deal(&seller, &100_000i128);
    }

    let profile = client.get_profile(&seller);
    assert_eq!(profile.completed_deals, 5);
    assert_eq!(profile.total_volume, 500_000);
}

// ──────────────────── Badge progression ────────────────────

#[test]
fn test_badge_new_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    // 0 deals → NewSeller
    assert_eq!(client.get_badge(&seller), TrustBadge::NewSeller);
}

#[test]
fn test_badge_rising_star() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for _ in 0..5 {
        client.record_completed_deal(&seller, &1i128);
    }
    assert_eq!(client.get_badge(&seller), TrustBadge::RisingStar);
}

#[test]
fn test_badge_trusted_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for _ in 0..20 {
        client.record_completed_deal(&seller, &1i128);
    }
    assert_eq!(client.get_badge(&seller), TrustBadge::TrustedSeller);
}

#[test]
fn test_badge_top_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for _ in 0..50 {
        client.record_completed_deal(&seller, &1i128);
    }
    assert_eq!(client.get_badge(&seller), TrustBadge::TopSeller);
}

#[test]
fn test_badge_elite_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for _ in 0..100 {
        client.record_completed_deal(&seller, &1i128);
    }
    assert_eq!(client.get_badge(&seller), TrustBadge::EliteSeller);
}

// ============================================================
// record_dispute_result tests
// ============================================================

#[test]
fn test_record_dispute_won() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.record_dispute_result(&seller, &true);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.disputes_won, 1);
    assert_eq!(profile.disputes_lost, 0);
}

#[test]
fn test_record_dispute_lost() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.record_dispute_result(&seller, &false);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.disputes_won, 0);
    assert_eq!(profile.disputes_lost, 1);
}

#[test]
fn test_record_multiple_dispute_results() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.record_dispute_result(&seller, &true);
    client.record_dispute_result(&seller, &true);
    client.record_dispute_result(&seller, &false);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.disputes_won, 2);
    assert_eq!(profile.disputes_lost, 1);
}

// ============================================================
// submit_review tests
// ============================================================

#[test]
fn test_submit_review() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);
    let buyer = Address::generate(&env);

    client.submit_review(
        &buyer,
        &seller,
        &String::from_str(&env, "DEAL-1"),
        &500u32,
        &String::from_str(&env, "Excellent seller!"),
    );

    let reviews = client.get_reviews(&seller);
    assert_eq!(reviews.len(), 1);
    assert_eq!(reviews.get(0).unwrap().rating, 500);
}

#[test]
fn test_submit_review_updates_avg_rating() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    // Two reviewers, ratings 400 and 200 → avg = 300
    let buyer1 = Address::generate(&env);
    let buyer2 = Address::generate(&env);

    client.submit_review(
        &buyer1,
        &seller,
        &String::from_str(&env, "DEAL-1"),
        &400u32,
        &String::from_str(&env, "Good"),
    );
    client.submit_review(
        &buyer2,
        &seller,
        &String::from_str(&env, "DEAL-2"),
        &200u32,
        &String::from_str(&env, "Ok"),
    );

    let profile = client.get_profile(&seller);
    assert_eq!(profile.total_ratings, 2);
    assert_eq!(profile.avg_rating, 300);
}

#[test]
#[should_panic(expected = "Cannot review yourself")]
fn test_submit_review_self() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.submit_review(
        &seller,
        &seller,
        &String::from_str(&env, "DEAL-1"),
        &500u32,
        &String::from_str(&env, "Self praise"),
    );
}

#[test]
#[should_panic(expected = "Rating must be between 100 and 500")]
fn test_submit_review_rating_too_low() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);
    let buyer = Address::generate(&env);

    client.submit_review(
        &buyer,
        &seller,
        &String::from_str(&env, "DEAL-1"),
        &50u32,   // below min
        &String::from_str(&env, "Bad"),
    );
}

#[test]
#[should_panic(expected = "Rating must be between 100 and 500")]
fn test_submit_review_rating_too_high() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);
    let buyer = Address::generate(&env);

    client.submit_review(
        &buyer,
        &seller,
        &String::from_str(&env, "DEAL-1"),
        &501u32,  // above max
        &String::from_str(&env, "Perfect"),
    );
}

#[test]
#[should_panic(expected = "Deal already reviewed")]
fn test_submit_review_duplicate_deal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);
    let buyer = Address::generate(&env);
    let deal_id = String::from_str(&env, "DEAL-1");

    client.submit_review(
        &buyer,
        &seller,
        &deal_id,
        &400u32,
        &String::from_str(&env, "First review"),
    );
    // Second review for the same deal should panic
    client.submit_review(
        &buyer,
        &seller,
        &deal_id,
        &300u32,
        &String::from_str(&env, "Second review"),
    );
}

#[test]
#[should_panic(expected = "Seller not found")]
fn test_submit_review_nonexistent_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let buyer = Address::generate(&env);
    let ghost_seller = Address::generate(&env);

    client.submit_review(
        &buyer,
        &ghost_seller,
        &String::from_str(&env, "DEAL-X"),
        &400u32,
        &String::from_str(&env, "Who?"),
    );
}

// ============================================================
// get_reviews tests
// ============================================================

#[test]
fn test_get_reviews_empty() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    let reviews = client.get_reviews(&seller);
    assert_eq!(reviews.len(), 0);
}

#[test]
fn test_get_reviews_multiple() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    for i in 0..4u32 {
        let buyer = Address::generate(&env);
        let deal_str = alloc::format!("DEAL-{}", i);
        client.submit_review(
            &buyer,
            &seller,
            &String::from_str(&env, &deal_str),
            &(100 + i * 100),
            &String::from_str(&env, "ok"),
        );
    }

    assert_eq!(client.get_reviews(&seller).len(), 4);
}

// ============================================================
// update_metadata tests
// ============================================================

#[test]
fn test_update_metadata() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    let uri = String::from_str(&env, "ipfs://QmXXX");
    client.update_metadata(&seller, &uri);

    let profile = client.get_profile(&seller);
    assert_eq!(profile.metadata_uri, Some(uri));
}

#[test]
fn test_update_metadata_overwrites() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = register_test_seller(&client, &env);

    client.update_metadata(&seller, &String::from_str(&env, "ipfs://old"));
    client.update_metadata(&seller, &String::from_str(&env, "ipfs://new"));

    let profile = client.get_profile(&seller);
    assert_eq!(
        profile.metadata_uri,
        Some(String::from_str(&env, "ipfs://new"))
    );
}

#[test]
#[should_panic(expected = "Seller not found")]
fn test_update_metadata_nonexistent_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    client.update_metadata(&random, &String::from_str(&env, "ipfs://xyz"));
}

// ============================================================
// get_profile tests
// ============================================================

#[test]
#[should_panic(expected = "Seller not found")]
fn test_get_profile_nonexistent() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let random = Address::generate(&env);
    client.get_profile(&random);
}

// ============================================================
// Integration: full seller lifecycle
// ============================================================

#[test]
fn test_full_seller_lifecycle() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // 1. Register
    let seller = register_test_seller(&client, &env);
    assert_eq!(client.get_profile(&seller).status, VerificationStatus::Pending);

    // 2. Verify
    client.verify_seller(&seller);
    assert!(client.is_verified(&seller));

    // 3. Record deals to upgrade badge
    for _ in 0..20 {
        client.record_completed_deal(&seller, &1_000_000i128);
    }
    assert_eq!(client.get_badge(&seller), TrustBadge::TrustedSeller);

    // 4. Submit a review
    let buyer = Address::generate(&env);
    client.submit_review(
        &buyer,
        &seller,
        &String::from_str(&env, "DEAL-FINAL"),
        &500u32,
        &String::from_str(&env, "Fantastic!"),
    );
    assert_eq!(client.get_profile(&seller).avg_rating, 500);

    // 5. Record dispute win
    client.record_dispute_result(&seller, &true);
    assert_eq!(client.get_profile(&seller).disputes_won, 1);

    // 6. Update metadata
    client.update_metadata(&seller, &String::from_str(&env, "ipfs://QmStoreDocs"));
    assert!(client.get_profile(&seller).metadata_uri.is_some());

    // 7. Suspend
    client.suspend_seller(&seller);
    assert_eq!(client.get_profile(&seller).status, VerificationStatus::Suspended);
    assert!(!client.is_verified(&seller));
}
