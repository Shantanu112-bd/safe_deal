#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Address, Env, String};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

fn setup_env() -> Env {
    let env = Env::default();
    env.mock_all_auths();
    env
}

fn init_contract(env: &Env) -> (FiatBridgeContractClient, Address) {
    let contract_id = env.register_contract(None, FiatBridgeContract);
    let client = FiatBridgeContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    client.initialize(&admin);
    (client, admin)
}

/// Register a generic INR anchor with a configurable fee (in bps).
fn register_inr_anchor(
    client: &FiatBridgeContractClient,
    env: &Env,
    anchor_id: &str,
    name: &str,
    fee_bps: u32,
) -> String {
    let currencies = vec![env, String::from_str(env, "INR")];
    let countries = vec![env, String::from_str(env, "IN")];

    client.register_anchor(
        &String::from_str(env, anchor_id),
        &String::from_str(env, name),
        &currencies,
        &countries,
        &1_000_000i128,   // min: 1 USDC (6 decimals)
        &100_000_000i128, // max: 100 USDC
        &fee_bps,
    )
}

/// Register a full multi-currency anchor for testing selection.
fn register_multi_currency_anchor(
    client: &FiatBridgeContractClient,
    env: &Env,
) {
    let currencies = vec![
        env,
        String::from_str(env, "INR"),
        String::from_str(env, "PHP"),
    ];
    let countries = vec![
        env,
        String::from_str(env, "IN"),
        String::from_str(env, "PH"),
    ];

    client.register_anchor(
        &String::from_str(env, "ANC-MULTI"),
        &String::from_str(env, "GlobalAnchor"),
        &currencies,
        &countries,
        &1_000_000i128,
        &500_000_000i128,
        &200u32, // 2%
    );
}

fn initiate_test_withdrawal(
    client: &FiatBridgeContractClient,
    env: &Env,
) -> (String, Address) {
    register_inr_anchor(client, env, "ANC-INR", "IndiaAnchor", 100);

    let seller = Address::generate(env);
    let withdrawal_id = client.initiate_withdrawal(
        &seller,
        &10_000_000i128, // 10 USDC (6 decimals)
        &String::from_str(env, "INR"),
        &String::from_str(env, "1234567890"),
        &String::from_str(env, "IN"),
    );
    (withdrawal_id, seller)
}

// ============================================================
// initialize tests
// ============================================================

#[test]
fn test_initialize() {
    let env = setup_env();
    let (_client, _admin) = init_contract(&env);
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
// register_anchor tests
// ============================================================

#[test]
fn test_register_anchor() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let id = register_inr_anchor(&client, &env, "ANC-001", "RupeePay", 150);
    assert_eq!(id, String::from_str(&env, "ANC-001"));

    // Retrieve and verify anchor via get_anchor_for_currency
    let result = client.get_anchor_for_currency(
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "IN"),
    );
    assert!(result.is_some());

    let anchor = result.unwrap();
    assert_eq!(anchor.id, String::from_str(&env, "ANC-001"));
    assert_eq!(anchor.name, String::from_str(&env, "RupeePay"));
    assert_eq!(anchor.fee_bps, 150);
    assert!(anchor.active);
    assert_eq!(anchor.min_amount, 1_000_000i128);
    assert_eq!(anchor.max_amount, 100_000_000i128);
}

#[test]
#[should_panic(expected = "Anchor already registered")]
fn test_register_anchor_duplicate() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-001", "RupeePay", 100);
    register_inr_anchor(&client, &env, "ANC-001", "RupeePay2", 200); // duplicate
}

#[test]
#[should_panic(expected = "Minimum amount must be positive")]
fn test_register_anchor_zero_min() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let currencies = vec![&env, String::from_str(&env, "INR")];
    let countries = vec![&env, String::from_str(&env, "IN")];
    client.register_anchor(
        &String::from_str(&env, "ANC-BAD"),
        &String::from_str(&env, "Bad"),
        &currencies,
        &countries,
        &0i128,  // invalid
        &100_000_000i128,
        &100u32,
    );
}

#[test]
#[should_panic(expected = "Maximum amount must be greater than minimum")]
fn test_register_anchor_max_less_than_min() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let currencies = vec![&env, String::from_str(&env, "INR")];
    let countries = vec![&env, String::from_str(&env, "IN")];
    client.register_anchor(
        &String::from_str(&env, "ANC-BAD"),
        &String::from_str(&env, "Bad"),
        &currencies,
        &countries,
        &1_000_000i128,
        &500_000i128, // less than min
        &100u32,
    );
}

#[test]
#[should_panic(expected = "Fee cannot exceed 10%")]
fn test_register_anchor_excessive_fee() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let currencies = vec![&env, String::from_str(&env, "INR")];
    let countries = vec![&env, String::from_str(&env, "IN")];
    client.register_anchor(
        &String::from_str(&env, "ANC-BAD"),
        &String::from_str(&env, "Bad"),
        &currencies,
        &countries,
        &1_000_000i128,
        &100_000_000i128,
        &1_001u32, // > 10%
    );
}

// ============================================================
// get_anchor_for_currency tests
// ============================================================

#[test]
fn test_get_anchor_for_currency_lowest_fee() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // Register two INR anchors – 200 bps and 100 bps
    register_inr_anchor(&client, &env, "ANC-HIGH", "HighFeeAnchor", 200);
    register_inr_anchor(&client, &env, "ANC-LOW", "LowFeeAnchor", 100);

    let result = client.get_anchor_for_currency(
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "IN"),
    );
    assert!(result.is_some());
    // Expect the lower-fee anchor
    assert_eq!(result.unwrap().id, String::from_str(&env, "ANC-LOW"));
}

#[test]
fn test_get_anchor_for_currency_none_when_no_match() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    // Request a currency with no registered anchor
    let result = client.get_anchor_for_currency(
        &String::from_str(&env, "NGN"),
        &String::from_str(&env, "NG"),
    );
    assert!(result.is_none());
}

#[test]
fn test_get_anchor_for_currency_country_filter() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // Anchor supports INR but only for IN, not PH
    register_inr_anchor(&client, &env, "ANC-IN", "IndiaAnchor", 100);

    let result = client.get_anchor_for_currency(
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "PH"), // wrong country
    );
    assert!(result.is_none());
}

#[test]
fn test_get_anchor_multi_currency() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_multi_currency_anchor(&client, &env);

    // Should find anchor for both INR/IN and PHP/PH
    let inr = client.get_anchor_for_currency(
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "IN"),
    );
    let php = client.get_anchor_for_currency(
        &String::from_str(&env, "PHP"),
        &String::from_str(&env, "PH"),
    );

    assert!(inr.is_some());
    assert!(php.is_some());
    assert_eq!(inr.unwrap().id, String::from_str(&env, "ANC-MULTI"));
}

// ============================================================
// initiate_withdrawal tests
// ============================================================

#[test]
fn test_initiate_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    let seller = Address::generate(&env);
    let withdrawal_id = client.initiate_withdrawal(
        &seller,
        &10_000_000i128, // 10 USDC
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "9876543210"),
        &String::from_str(&env, "IN"),
    );

    assert_eq!(withdrawal_id, String::from_str(&env, "WDR-1"));

    let w = client.get_withdrawal(&withdrawal_id);
    assert_eq!(w.seller, seller);
    assert_eq!(w.amount_usdc, 10_000_000);
    assert_eq!(w.status, WithdrawalStatus::Pending);
    assert_eq!(w.target_currency, String::from_str(&env, "INR"));
    assert_eq!(w.anchor_id, String::from_str(&env, "ANC-INR"));
    assert!(w.anchor_reference.is_none());
    assert!(w.completed_at.is_none());
}

#[test]
fn test_initiate_withdrawal_fee_deduction() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // Anchor fee: 100 bps = 1%
    // SafeDeal fee: 50 bps = 0.5%
    // Total fees on 10_000_000 = 150_000
    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    let seller = Address::generate(&env);
    let withdrawal_id = client.initiate_withdrawal(
        &seller,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "1234567890"),
        &String::from_str(&env, "IN"),
    );

    let w = client.get_withdrawal(&withdrawal_id);
    // anchor_fee = 10_000_000 * 100 / 10_000 = 100_000
    // safedeal_fee = 10_000_000 * 50 / 10_000 = 50_000
    // total = 150_000
    assert_eq!(w.total_fees_usdc, 150_000);
    assert_eq!(w.net_amount_usdc, 9_850_000);
}

#[test]
fn test_initiate_withdrawal_increments_id() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    let seller = Address::generate(&env);
    let id1 = client.initiate_withdrawal(
        &seller,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "ACC1"),
        &String::from_str(&env, "IN"),
    );
    let id2 = client.initiate_withdrawal(
        &seller,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "ACC2"),
        &String::from_str(&env, "IN"),
    );

    assert_eq!(id1, String::from_str(&env, "WDR-1"));
    assert_eq!(id2, String::from_str(&env, "WDR-2"));
}

#[test]
#[should_panic(expected = "Withdrawal amount must be positive")]
fn test_initiate_withdrawal_zero_amount() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);
    let seller = Address::generate(&env);

    client.initiate_withdrawal(
        &seller,
        &0i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "123"),
        &String::from_str(&env, "IN"),
    );
}

#[test]
#[should_panic(expected = "No anchor found for currency/country")]
fn test_initiate_withdrawal_no_anchor() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // No anchors registered at all
    let seller = Address::generate(&env);
    client.initiate_withdrawal(
        &seller,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "123"),
        &String::from_str(&env, "IN"),
    );
}

#[test]
#[should_panic(expected = "Amount below anchor minimum")]
fn test_initiate_withdrawal_below_minimum() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);
    let seller = Address::generate(&env);

    // min is 1_000_000; send 500_000 (below min)
    client.initiate_withdrawal(
        &seller,
        &500_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "123"),
        &String::from_str(&env, "IN"),
    );
}

#[test]
#[should_panic(expected = "Amount exceeds anchor maximum")]
fn test_initiate_withdrawal_above_maximum() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);
    let seller = Address::generate(&env);

    // max is 100_000_000; send 200_000_000 (above max)
    client.initiate_withdrawal(
        &seller,
        &200_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "123"),
        &String::from_str(&env, "IN"),
    );
}

// ============================================================
// confirm_withdrawal tests
// ============================================================

#[test]
fn test_confirm_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let (withdrawal_id, _seller) = initiate_test_withdrawal(&client, &env);

    let anchor_ref = String::from_str(&env, "ANCHOR-TXN-XYZ-001");
    client.confirm_withdrawal(&withdrawal_id, &anchor_ref);

    let w = client.get_withdrawal(&withdrawal_id);
    assert_eq!(w.status, WithdrawalStatus::Completed);
    assert_eq!(w.anchor_reference, Some(anchor_ref));
    assert!(w.completed_at.is_some());
}

#[test]
#[should_panic(expected = "Withdrawal cannot be confirmed in current status")]
fn test_confirm_already_completed_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let (withdrawal_id, _seller) = initiate_test_withdrawal(&client, &env);

    client.confirm_withdrawal(&withdrawal_id, &String::from_str(&env, "REF-1"));
    // Confirm again should panic
    client.confirm_withdrawal(&withdrawal_id, &String::from_str(&env, "REF-2"));
}

#[test]
#[should_panic(expected = "Withdrawal not found")]
fn test_confirm_nonexistent_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    client.confirm_withdrawal(
        &String::from_str(&env, "WDR-999"),
        &String::from_str(&env, "REF"),
    );
}

// ============================================================
// cancel_withdrawal tests
// ============================================================

#[test]
fn test_cancel_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let (withdrawal_id, _seller) = initiate_test_withdrawal(&client, &env);

    client.cancel_withdrawal(&withdrawal_id);

    let w = client.get_withdrawal(&withdrawal_id);
    assert_eq!(w.status, WithdrawalStatus::Cancelled);
    assert!(w.completed_at.is_some());
    // USDC is returned – represented by Cancelled status (in a real contract
    // this would trigger a token transfer; here we verify state only)
}

#[test]
#[should_panic(expected = "Only Pending withdrawals can be cancelled")]
fn test_cancel_completed_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    let (withdrawal_id, _seller) = initiate_test_withdrawal(&client, &env);

    client.confirm_withdrawal(&withdrawal_id, &String::from_str(&env, "REF-1"));
    client.cancel_withdrawal(&withdrawal_id); // already completed → should panic
}

#[test]
#[should_panic(expected = "Withdrawal not found")]
fn test_cancel_nonexistent_withdrawal() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    client.cancel_withdrawal(&String::from_str(&env, "WDR-9999"));
}

// ============================================================
// calculate_fees tests
// ============================================================

#[test]
fn test_calculate_fees() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // Register an INR anchor with 1% fee (100 bps)
    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    // 100 USDC = 100_000_000 stroops
    let gross = 100_000_000i128;
    let fc = client.calculate_fees(&gross, &String::from_str(&env, "INR"));

    assert_eq!(fc.gross_amount_usdc, gross);

    // anchor fee: 100 bps on 100_000_000 = 1_000_000
    assert_eq!(fc.anchor_fee_usdc, 1_000_000);

    // SafeDeal fee: 50 bps = 0.5% → 500_000
    assert_eq!(fc.safedeal_fee_usdc, 500_000);

    // net = 100_000_000 - 1_500_000 = 98_500_000
    assert_eq!(fc.net_amount_usdc, 98_500_000);

    // INR rate = 8350 (83.50 per USDC x100)
    // local = 98_500_000 * 8350 / 100 = 8_224_750_000
    assert_eq!(fc.exchange_rate, 8_350);
    assert_eq!(fc.estimated_local_amount, 98_500_000i128 * 8_350 / 100);
}

#[test]
fn test_calculate_fees_safedeal_only_when_no_anchor() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // No anchor registered – anchor_fee should be 0
    let gross = 10_000_000i128;
    let fc = client.calculate_fees(&gross, &String::from_str(&env, "INR"));

    assert_eq!(fc.anchor_fee_usdc, 0);
    // Only SafeDeal fee: 50 bps on 10_000_000 = 50_000
    assert_eq!(fc.safedeal_fee_usdc, 50_000);
    assert_eq!(fc.net_amount_usdc, 9_950_000);
}

// ============================================================
// get_exchange_rate tests
// ============================================================

#[test]
fn test_exchange_rates_all_currencies() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    assert_eq!(client.get_exchange_rate(&String::from_str(&env, "INR")), 8_350);
    assert_eq!(client.get_exchange_rate(&String::from_str(&env, "NGN")), 160_000);
    assert_eq!(client.get_exchange_rate(&String::from_str(&env, "BRL")), 490);
    assert_eq!(client.get_exchange_rate(&String::from_str(&env, "PHP")), 5_600);
    assert_eq!(client.get_exchange_rate(&String::from_str(&env, "IDR")), 1_590_000);
}

#[test]
#[should_panic(expected = "Unsupported currency code")]
fn test_exchange_rate_unsupported_currency() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    client.get_exchange_rate(&String::from_str(&env, "USD"));
}

// ============================================================
// get_seller_withdrawals tests
// ============================================================

#[test]
fn test_get_seller_withdrawals_empty() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);
    let seller = Address::generate(&env);

    let withdrawals = client.get_seller_withdrawals(&seller);
    assert_eq!(withdrawals.len(), 0);
}

#[test]
fn test_get_seller_withdrawals_multiple() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);
    let seller = Address::generate(&env);

    // Create 3 withdrawals for the same seller
    for i in 0..3u32 {
        let acc = alloc::format!("ACCOUNT-{}", i);
        client.initiate_withdrawal(
            &seller,
            &10_000_000i128,
            &String::from_str(&env, "INR"),
            &String::from_str(&env, &acc),
            &String::from_str(&env, "IN"),
        );
    }

    let withdrawals = client.get_seller_withdrawals(&seller);
    assert_eq!(withdrawals.len(), 3);

    // Each withdrawal should belong to our seller
    for w in withdrawals.iter() {
        assert_eq!(w.seller, seller);
    }
}

#[test]
fn test_get_seller_withdrawals_independent_per_seller() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    let seller_a = Address::generate(&env);
    let seller_b = Address::generate(&env);

    // 2 withdrawals for seller A, 1 for seller B
    client.initiate_withdrawal(
        &seller_a,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "A1"),
        &String::from_str(&env, "IN"),
    );
    client.initiate_withdrawal(
        &seller_a,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "A2"),
        &String::from_str(&env, "IN"),
    );
    client.initiate_withdrawal(
        &seller_b,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "B1"),
        &String::from_str(&env, "IN"),
    );

    assert_eq!(client.get_seller_withdrawals(&seller_a).len(), 2);
    assert_eq!(client.get_seller_withdrawals(&seller_b).len(), 1);
}

// ============================================================
// Integration: full fiat withdrawal lifecycle
// ============================================================

#[test]
fn test_full_withdrawal_lifecycle() {
    let env = setup_env();
    let (client, _admin) = init_contract(&env);

    // 1. Register an INR anchor
    register_inr_anchor(&client, &env, "ANC-INR", "IndiaAnchor", 100);

    // 2. Preview fees before initiating
    let fc = client.calculate_fees(
        &10_000_000i128,
        &String::from_str(&env, "INR"),
    );
    assert!(fc.net_amount_usdc < 10_000_000);

    // 3. Initiate withdrawal
    let seller = Address::generate(&env);
    let wid = client.initiate_withdrawal(
        &seller,
        &10_000_000i128,
        &String::from_str(&env, "INR"),
        &String::from_str(&env, "UPIVPA@bank"),
        &String::from_str(&env, "IN"),
    );

    let w = client.get_withdrawal(&wid);
    assert_eq!(w.status, WithdrawalStatus::Pending);

    // 4. Anchor confirms fiat was sent
    client.confirm_withdrawal(&wid, &String::from_str(&env, "NEFT-TXN-12345"));

    let w = client.get_withdrawal(&wid);
    assert_eq!(w.status, WithdrawalStatus::Completed);
    assert_eq!(
        w.anchor_reference,
        Some(String::from_str(&env, "NEFT-TXN-12345"))
    );

    // 5. Verify in seller history
    let history = client.get_seller_withdrawals(&seller);
    assert_eq!(history.len(), 1);
    assert_eq!(history.get(0).unwrap().status, WithdrawalStatus::Completed);
}
