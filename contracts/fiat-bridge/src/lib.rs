#![no_std]
extern crate alloc;

use alloc::string::ToString;
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum WithdrawalStatus {
    Pending,
    Processing,
    Completed,
    Failed,
    Cancelled,
}

// ──────────────────────────────────────────────
// Structs
// ──────────────────────────────────────────────

/// A registered Stellar Anchor that can process fiat settlements
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Anchor {
    pub id: String,
    pub name: String,
    pub supported_currencies: Vec<String>,
    pub country_codes: Vec<String>,
    pub min_amount: i128,
    pub max_amount: i128,
    /// Fee in basis points, e.g. 150 = 1.5%
    pub fee_bps: u32,
    pub active: bool,
}

/// A fiat withdrawal request from USDC to local currency
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Withdrawal {
    pub id: String,
    pub seller: Address,
    pub amount_usdc: i128,
    pub target_currency: String,
    pub bank_account: String,
    pub country_code: String,
    pub anchor_id: String,
    pub status: WithdrawalStatus,
    /// Total fees in USDC (anchor + SafeDeal)
    pub total_fees_usdc: i128,
    /// Net USDC after fees
    pub net_amount_usdc: i128,
    pub created_at: u64,
    pub completed_at: Option<u64>,
    pub anchor_reference: Option<String>,
    /// Exchange rate used (stored x100, e.g. 8350 = 83.50 INR/USDC)
    pub exchange_rate: u32,
}

/// Detailed fee breakdown for a withdrawal
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FeeCalculation {
    pub gross_amount_usdc: i128,
    pub anchor_fee_usdc: i128,
    /// SafeDeal platform fee (0.5%)
    pub safedeal_fee_usdc: i128,
    pub net_amount_usdc: i128,
    /// Estimated local currency amount (net_usdc * rate / 100)
    pub estimated_local_amount: i128,
    /// Exchange rate x100
    pub exchange_rate: u32,
    pub currency: String,
}

// ──────────────────────────────────────────────
// Storage keys
// ──────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Anchor(String),              // anchor_id → Anchor
    AllAnchors,                  // Vec<String> (anchor ids)
    Withdrawal(String),          // withdrawal_id → Withdrawal
    SellerWithdrawals(Address),  // seller → Vec<String> (withdrawal ids)
    NextWithdrawalId,
}

// ──────────────────────────────────────────────
// SafeDeal fee constant: 0.5% = 50 bps
// ──────────────────────────────────────────────

const SAFEDEAL_FEE_BPS: u32 = 50;
const BPS_DENOM: i128 = 10_000;

// ──────────────────────────────────────────────
// Contract
// ──────────────────────────────────────────────

#[contract]
pub struct FiatBridgeContract;

#[contractimpl]
impl FiatBridgeContract {
    // ─────────────────────── Initialization ───────────────────────

    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);

        let anchors: Vec<String> = Vec::new(&env);
        env.storage().instance().set(&DataKey::AllAnchors, &anchors);
    }

    // ─────────────────────── Anchor management ────────────────────

    /// Register a new Stellar Anchor (admin only)
    pub fn register_anchor(
        env: Env,
        anchor_id: String,
        name: String,
        supported_currencies: Vec<String>,
        country_codes: Vec<String>,
        min_amount: i128,
        max_amount: i128,
        fee_bps: u32,
    ) -> String {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        if min_amount <= 0 {
            panic!("Minimum amount must be positive");
        }
        if max_amount <= min_amount {
            panic!("Maximum amount must be greater than minimum");
        }
        if fee_bps > 1_000 {
            // cap at 10%
            panic!("Fee cannot exceed 10%");
        }
        if supported_currencies.is_empty() {
            panic!("Anchor must support at least one currency");
        }

        // Prevent duplicate registration
        if env
            .storage()
            .instance()
            .has(&DataKey::Anchor(anchor_id.clone()))
        {
            panic!("Anchor already registered");
        }

        let anchor = Anchor {
            id: anchor_id.clone(),
            name,
            supported_currencies,
            country_codes,
            min_amount,
            max_amount,
            fee_bps,
            active: true,
        };

        env.storage()
            .instance()
            .set(&DataKey::Anchor(anchor_id.clone()), &anchor);

        // Add to anchor index
        let mut all: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::AllAnchors)
            .unwrap_or(Vec::new(&env));
        all.push_back(anchor_id.clone());
        env.storage().instance().set(&DataKey::AllAnchors, &all);

        env.events().publish(
            (symbol_short!("Anchor"), symbol_short!("register")),
            anchor_id.clone(),
        );

        anchor_id
    }

    /// Return the active anchor with the lowest fee that supports the
    /// given currency + country combination. Returns None if no match.
    pub fn get_anchor_for_currency(
        env: Env,
        currency_code: String,
        country_code: String,
    ) -> Option<Anchor> {
        let all: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::AllAnchors)
            .unwrap_or(Vec::new(&env));

        let mut best: Option<Anchor> = None;

        for id in all.iter() {
            let anchor: Anchor = match env
                .storage()
                .instance()
                .get(&DataKey::Anchor(id.clone()))
            {
                Some(a) => a,
                None => continue,
            };

            if !anchor.active {
                continue;
            }

            // Check currency supported
            let mut currency_ok = false;
            for c in anchor.supported_currencies.iter() {
                if c == currency_code {
                    currency_ok = true;
                    break;
                }
            }
            if !currency_ok {
                continue;
            }

            // Check country supported
            let mut country_ok = false;
            for c in anchor.country_codes.iter() {
                if c == country_code {
                    country_ok = true;
                    break;
                }
            }
            if !country_ok {
                continue;
            }

            // Pick the anchor with the lowest fee
            match &best {
                None => best = Some(anchor),
                Some(current_best) => {
                    if anchor.fee_bps < current_best.fee_bps {
                        best = Some(anchor);
                    }
                }
            }
        }

        best
    }

    // ─────────────────────── Withdrawal lifecycle ─────────────────

    /// Initiate a USDC → fiat withdrawal via a registered anchor.
    /// Returns a unique withdrawal ID.
    pub fn initiate_withdrawal(
        env: Env,
        seller: Address,
        amount_usdc: i128,
        target_currency: String,
        bank_account: String,
        country_code: String,
    ) -> String {
        seller.require_auth();

        if amount_usdc <= 0 {
            panic!("Withdrawal amount must be positive");
        }
        if bank_account.is_empty() {
            panic!("Bank account cannot be empty");
        }

        // Find best anchor
        let anchor = Self::get_anchor_for_currency(
            env.clone(),
            target_currency.clone(),
            country_code.clone(),
        )
        .unwrap_or_else(|| panic!("No anchor found for currency/country"));

        if amount_usdc < anchor.min_amount {
            panic!("Amount below anchor minimum");
        }
        if amount_usdc > anchor.max_amount {
            panic!("Amount exceeds anchor maximum");
        }

        // Calculate fees
        let fee_calc = Self::_calculate_fees(
            &env,
            amount_usdc,
            target_currency.clone(),
            anchor.fee_bps,
        );

        // Generate withdrawal ID
        let next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextWithdrawalId)
            .unwrap_or(1);
        let id_str = alloc::format!("WDR-{}", next_id);
        let withdrawal_id = String::from_str(&env, &id_str);
        env.storage()
            .instance()
            .set(&DataKey::NextWithdrawalId, &(next_id + 1));

        let withdrawal = Withdrawal {
            id: withdrawal_id.clone(),
            seller: seller.clone(),
            amount_usdc,
            target_currency,
            bank_account,
            country_code,
            anchor_id: anchor.id,
            status: WithdrawalStatus::Pending,
            total_fees_usdc: fee_calc.anchor_fee_usdc + fee_calc.safedeal_fee_usdc,
            net_amount_usdc: fee_calc.net_amount_usdc,
            created_at: env.ledger().timestamp(),
            completed_at: None,
            anchor_reference: None,
            exchange_rate: fee_calc.exchange_rate,
        };

        env.storage()
            .instance()
            .set(&DataKey::Withdrawal(withdrawal_id.clone()), &withdrawal);

        // Update seller index
        let mut seller_wdrs: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerWithdrawals(seller.clone()))
            .unwrap_or(Vec::new(&env));
        seller_wdrs.push_back(withdrawal_id.clone());
        env.storage()
            .instance()
            .set(&DataKey::SellerWithdrawals(seller), &seller_wdrs);

        env.events().publish(
            (symbol_short!("Fiat"), symbol_short!("initiate")),
            withdrawal_id.clone(),
        );

        withdrawal_id
    }

    /// Anchor confirms fiat payment was sent to the bank account.
    /// Transitions status to Completed.
    pub fn confirm_withdrawal(
        env: Env,
        withdrawal_id: String,
        anchor_reference: String,
    ) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();

        let mut withdrawal: Withdrawal = env
            .storage()
            .instance()
            .get(&DataKey::Withdrawal(withdrawal_id.clone()))
            .unwrap_or_else(|| panic!("Withdrawal not found"));

        if withdrawal.status != WithdrawalStatus::Pending
            && withdrawal.status != WithdrawalStatus::Processing
        {
            panic!("Withdrawal cannot be confirmed in current status");
        }

        withdrawal.status = WithdrawalStatus::Completed;
        withdrawal.anchor_reference = Some(anchor_reference);
        withdrawal.completed_at = Some(env.ledger().timestamp());

        env.storage()
            .instance()
            .set(&DataKey::Withdrawal(withdrawal_id.clone()), &withdrawal);

        env.events().publish(
            (symbol_short!("Fiat"), symbol_short!("complete")),
            withdrawal_id,
        );
    }

    /// Cancel a Pending withdrawal and return USDC to the seller's wallet.
    pub fn cancel_withdrawal(env: Env, withdrawal_id: String) {
        let mut withdrawal: Withdrawal = env
            .storage()
            .instance()
            .get(&DataKey::Withdrawal(withdrawal_id.clone()))
            .unwrap_or_else(|| panic!("Withdrawal not found"));

        // Only the seller or admin may cancel
        withdrawal.seller.require_auth();

        if withdrawal.status != WithdrawalStatus::Pending {
            panic!("Only Pending withdrawals can be cancelled");
        }

        withdrawal.status = WithdrawalStatus::Cancelled;
        withdrawal.completed_at = Some(env.ledger().timestamp());

        env.storage()
            .instance()
            .set(&DataKey::Withdrawal(withdrawal_id.clone()), &withdrawal);

        env.events().publish(
            (symbol_short!("Fiat"), symbol_short!("cancel")),
            withdrawal_id,
        );
    }

    // ─────────────────────── Fee & Rate helpers ────────────────────

    /// Public fee calculator – uses the best anchor's fee for the currency.
    pub fn calculate_fees(
        env: Env,
        amount_usdc: i128,
        currency_code: String,
    ) -> FeeCalculation {
        if amount_usdc <= 0 {
            panic!("Amount must be positive");
        }

        // We look up the best anchor to get its fee percentage.
        // If no anchor found we default to 0 anchor fee so callers can
        // still get a SafeDeal‐fee + rate preview.
        let anchor_fee_bps: u32 = {
            let all: Vec<String> = env
                .storage()
                .instance()
                .get(&DataKey::AllAnchors)
                .unwrap_or(Vec::new(&env));

            let mut best_bps: Option<u32> = None;
            for id in all.iter() {
                let anchor: Anchor = match env
                    .storage()
                    .instance()
                    .get(&DataKey::Anchor(id.clone()))
                {
                    Some(a) => a,
                    None => continue,
                };
                if !anchor.active {
                    continue;
                }
                let mut supports = false;
                for c in anchor.supported_currencies.iter() {
                    if c == currency_code {
                        supports = true;
                        break;
                    }
                }
                if !supports {
                    continue;
                }
                match best_bps {
                    None => best_bps = Some(anchor.fee_bps),
                    Some(cur) => {
                        if anchor.fee_bps < cur {
                            best_bps = Some(anchor.fee_bps);
                        }
                    }
                }
            }
            best_bps.unwrap_or(0)
        };

        Self::_calculate_fees(&env, amount_usdc, currency_code, anchor_fee_bps)
    }

    /// Get the mock exchange rate for a currency (stored x100).
    pub fn get_exchange_rate(_env: Env, currency_code: String) -> u32 {
        Self::_exchange_rate(&currency_code)
    }

    // ─────────────────────── Queries ──────────────────────────────

    /// Fetch a withdrawal by its ID
    pub fn get_withdrawal(env: Env, withdrawal_id: String) -> Withdrawal {
        env.storage()
            .instance()
            .get(&DataKey::Withdrawal(withdrawal_id))
            .unwrap_or_else(|| panic!("Withdrawal not found"))
    }

    /// Fetch all withdrawals belonging to a seller
    pub fn get_seller_withdrawals(env: Env, seller: Address) -> Vec<Withdrawal> {
        let ids: Vec<String> = env
            .storage()
            .instance()
            .get(&DataKey::SellerWithdrawals(seller))
            .unwrap_or(Vec::new(&env));

        let mut result = Vec::new(&env);
        for id in ids.iter() {
            if let Some(w) = env
                .storage()
                .instance()
                .get(&DataKey::Withdrawal(id.clone()))
            {
                result.push_back(w);
            }
        }
        result
    }

    // ─────────────────────── Private helpers ────────────────────

    /// Core fee calculation logic shared by public and internal callers.
    fn _calculate_fees(
        env: &Env,
        amount_usdc: i128,
        currency_code: String,
        anchor_fee_bps: u32,
    ) -> FeeCalculation {
        let rate = Self::_exchange_rate(&currency_code);

        let anchor_fee_usdc = (amount_usdc * anchor_fee_bps as i128) / BPS_DENOM;
        let safedeal_fee_usdc = (amount_usdc * SAFEDEAL_FEE_BPS as i128) / BPS_DENOM;
        let net_amount_usdc = amount_usdc - anchor_fee_usdc - safedeal_fee_usdc;

        // Estimated local amount: net_usdc * (rate / 100)
        // rate is stored x100, so: net * rate / 100
        let estimated_local_amount = (net_amount_usdc * rate as i128) / 100;

        FeeCalculation {
            gross_amount_usdc: amount_usdc,
            anchor_fee_usdc,
            safedeal_fee_usdc,
            net_amount_usdc,
            estimated_local_amount,
            exchange_rate: rate,
            currency: currency_code,
        }
    }

    /// Returns mock exchange rates stored as (actual_rate * 100).
    ///
    /// | Currency | Rate/USDC | Stored |
    /// |----------|-----------|--------|
    /// | INR      | 83.50     | 8350   |
    /// | NGN      | 1600.00   | 160000 |
    /// | BRL      | 4.90      | 490    |
    /// | PHP      | 56.00     | 5600   |
    /// | IDR      | 15900.00  | 1590000|
    fn _exchange_rate(currency_code: &String) -> u32 {
        // We can't use match on soroban String directly, so we compare manually.
        const RATES: &[(&str, u32)] = &[
            ("INR", 8_350),
            ("NGN", 160_000),
            ("BRL", 490),
            ("PHP", 5_600),
            ("IDR", 1_590_000),
        ];

        let code_bytes = currency_code.to_string();
        for (code, rate) in RATES.iter() {
            if code_bytes == *code {
                return *rate;
            }
        }
        panic!("Unsupported currency code");
    }
}

mod test;
