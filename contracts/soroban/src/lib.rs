#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, panic_with_error,
    token, Address, BytesN, Env,
};

/// ~1 year in ledgers at ~5 s/ledger on Stellar mainnet.
const TTL_BUMP: u32 = 17_280 * 365;
/// Extend TTL when less than 30 days remain.
const TTL_MIN: u32 = 17_280 * 30;
/// Maximum allowed subscription interval (10 years, in seconds). Bounds
/// `next_payment` arithmetic so it can never overflow a `u64` timestamp
/// and rules out absurd configurations at creation time.
const MAX_INTERVAL: u64 = 10 * 365 * 24 * 60 * 60;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum SubscriptionError {
    NotFound           = 1,
    Inactive           = 2,
    NotDue             = 3,
    InvalidAmount      = 4,
    InvalidInterval    = 5,
    AlreadyInitialized = 6,
    NotInitialized     = 7,
    ContractPaused     = 8,
    ArithmeticOverflow = 9,
    InvalidRecipient   = 10,
    InvalidToken       = 11,
    InvalidCount       = 13,
}

#[contracttype]
#[derive(Clone)]
pub struct Subscription {
    pub subscriber: Address,
    pub token: Address,
    pub recipient: Address,
    pub amount: i128,
    pub interval: u64,
    pub next_payment: u64,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Sub(u64),
    Counter,
    Owner,
    Paused,
}

// ===========================================================================
// Contract events
//
// Each `#[contractevent]` struct emits an event whose first static topic is
// the struct name in `snake_case` (e.g. `TriggerN` -> `trigger_n`). Fields
// annotated `#[topic]` are appended to the topic list; the remaining fields
// form the data payload, shaped by `data_format`:
// * `single-value`: data is the lone non-topic field, emitted directly.
// * `vec`: non-topic fields are packed into a `Vec<Val>` in declaration order.
// * default (no attribute): non-topic fields are packed into a `Map` keyed by
//   field name.
// ===========================================================================

/// Emitted once at deployment by `__constructor`.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct Init {
    pub owner: Address,
}

/// Emitted by `pause`. Empty payload — the topic alone carries the signal.
#[contractevent]
#[derive(Clone)]
pub struct Pause {}

/// Emitted by `unpause`.
#[contractevent]
#[derive(Clone)]
pub struct Unpause {}

/// Emitted by `transfer_ownership` after the new owner has been stored.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct OwnXfer {
    pub new_owner: Address,
}

/// Emitted by `upgrade`.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct Upgrade {
    pub new_wasm_hash: BytesN<32>,
}

/// Emitted on successful subscription creation.
#[contractevent(data_format = "vec")]
#[derive(Clone)]
pub struct Create {
    #[topic]
    pub id: u64,
    pub subscriber: Address,
    pub recipient: Address,
    pub amount: i128,
    pub interval: u64,
}

/// Emitted by `trigger` after a successful single-cycle pull.
#[contractevent(data_format = "vec")]
#[derive(Clone)]
pub struct Trigger {
    #[topic]
    pub id: u64,
    pub subscriber: Address,
    pub recipient: Address,
    pub amount: i128,
}

/// Emitted by `trigger_n` after a successful multi-cycle pull. `cycles`
/// reports how many cycles were actually settled (capped at `due_cycles`).
#[contractevent(data_format = "vec")]
#[derive(Clone)]
pub struct TriggerN {
    #[topic]
    pub id: u64,
    pub subscriber: Address,
    pub recipient: Address,
    pub total_amount: i128,
    pub cycles: u64,
}

/// Emitted by `cancel`. Frontends listening for this event should prompt the
/// subscriber to revoke their token allowance: `token.approve(contract, 0)`.
#[contractevent(data_format = "single-value")]
#[derive(Clone)]
pub struct Cancel {
    #[topic]
    pub id: u64,
    pub subscriber: Address,
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    /// Atomic constructor — invoked exactly once by the Soroban runtime
    /// at contract deployment. This eliminates the front-running window that a
    /// two-step `deploy` + `initialize` flow would expose.
    pub fn __constructor(env: Env, owner: Address) {
        owner.require_auth();
        // Governance flags live in PERSISTENT storage, not instance storage.
        // Instance storage TTL-expires silently after a period of inactivity,
        // and `unwrap_or(false)` on a missing `Paused` would default to
        // "unpaused" — meaning a long emergency-pause window with no other
        // successful calls to bump instance TTL could expire the entry and
        // silently resume `create`/`trigger`, while admin entrypoints become
        // unusable because `Owner` would also be gone. Persistent entries
        // can be bumped indefinitely and, if archived, must be explicitly
        // restored — their value is never silently "defaulted".
        env.storage().persistent().set(&DataKey::Owner, &owner);
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Owner, TTL_MIN, TTL_BUMP);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, TTL_MIN, TTL_BUMP);
        // Bump the contract instance TTL so the contract itself stays alive.
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        Init { owner }.publish(&env);
    }

    /// Pause all payment triggers and new subscription creation. Owner only.
    /// The `Paused` flag lives in persistent storage and its TTL is bumped
    /// on every toggle so a prolonged pause window cannot silently expire.
    pub fn pause(env: Env) {
        Self::require_owner(&env);
        env.storage().persistent().set(&DataKey::Paused, &true);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, TTL_MIN, TTL_BUMP);
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        Pause {}.publish(&env);
    }

    /// Resume normal operation. Owner only.
    pub fn unpause(env: Env) {
        Self::require_owner(&env);
        env.storage().persistent().set(&DataKey::Paused, &false);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, TTL_MIN, TTL_BUMP);
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        Unpause {}.publish(&env);
    }

    /// Atomically transfer ownership. The transaction must carry signatures
    /// from BOTH the current owner and the new owner — this rules out
    /// transferring to a wrong or unresponsive address (the wrong key cannot
    /// sign) without requiring a separate acceptance step.
    pub fn transfer_ownership(env: Env, new_owner: Address) {
        Self::require_owner(&env);
        new_owner.require_auth();
        env.storage().persistent().set(&DataKey::Owner, &new_owner);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Owner, TTL_MIN, TTL_BUMP);
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        OwnXfer { new_owner }.publish(&env);
    }

    /// Hot-swap the contract WASM. Owner only. Use to patch bugs without
    /// draining user allowances; always couple with `pause` + off-chain review
    /// of `new_wasm_hash` before calling.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        Self::require_owner(&env);
        env.deployer()
            .update_current_contract_wasm(new_wasm_hash.clone());
        Upgrade { new_wasm_hash }.publish(&env);
    }

    /// Create a new recurring subscription.
    ///
    /// `token` MUST be a SEP-41-compliant contract address. Passing a non-compliant
    /// address will not fail at creation time — it will cause `trigger` to panic when
    /// `transfer_from` is invoked. The caller is responsible for verifying the token.
    ///
    /// `interval` is in seconds and must be in `1..=MAX_INTERVAL` (10 years).
    ///
    /// The subscriber must call `token.approve(this_contract_address, amount)` before
    /// each payment cycle, or once with a sufficiently large allowance.
    /// After calling `cancel`, the subscriber MUST also call
    /// `token.approve(this_contract_address, 0)` to revoke the allowance.
    pub fn create(
        env: Env,
        subscriber: Address,
        token: Address,
        recipient: Address,
        amount: i128,
        interval: u64,
    ) -> u64 {
        Self::require_not_paused(&env);
        subscriber.require_auth();
        if amount <= 0 {
            panic_with_error!(&env, SubscriptionError::InvalidAmount);
        }
        // Reject zero and absurdly large intervals to prevent overflow
        // in `next_payment` arithmetic on this and future cycles.
        if interval == 0 || interval > MAX_INTERVAL {
            panic_with_error!(&env, SubscriptionError::InvalidInterval);
        }
        // Reject self-addressed recipient or token. `recipient == self`
        // would strand funds in this contract; `token == self` would recurse
        // on `transfer_from` with undefined semantics.
        let self_addr = env.current_contract_address();
        if token == self_addr {
            panic_with_error!(&env, SubscriptionError::InvalidToken);
        }
        if recipient == self_addr {
            panic_with_error!(&env, SubscriptionError::InvalidRecipient);
        }
        let next_payment = env
            .ledger()
            .timestamp()
            .checked_add(interval)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        // Counter lives in persistent storage so IDs keep incrementing
        // even if instance storage expires, ruling out any ID collision with
        // previously created (and still persistent) subscriptions.
        let id: u64 = env
            .storage()
            .persistent()
            .get::<_, u64>(&DataKey::Counter)
            .unwrap_or(0)
            .checked_add(1)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        env.storage().persistent().set(&DataKey::Counter, &id);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Counter, TTL_MIN, TTL_BUMP);
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        let sub = Subscription {
            subscriber: subscriber.clone(),
            token,
            recipient: recipient.clone(),
            amount,
            interval,
            next_payment,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
        env.storage().persistent().extend_ttl(&DataKey::Sub(id), TTL_MIN, TTL_BUMP);
        Create {
            id,
            subscriber,
            recipient,
            amount,
            interval,
        }
        .publish(&env);
        id
    }

    /// Trigger the next payment for subscription `id`.
    ///
    /// **Permissionless**: anyone (keeper, bot, recipient, subscriber) may call
    /// this once the payment is due. Safety derives from:
    /// - the pre-approved `allowance` (subscriber's consent to pull funds), and
    /// - the `recipient` being fixed at creation (no third party can redirect).
    ///
    /// The token is pulled from the subscriber via `transfer_from`, so the
    /// subscriber must have granted a sufficient allowance to this contract
    /// address beforehand.
    pub fn trigger(env: Env, id: u64) {
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        Self::require_not_paused(&env);
        let mut sub: Subscription = match env.storage().persistent().get(&DataKey::Sub(id)) {
            Some(s) => s,
            None => panic_with_error!(&env, SubscriptionError::NotFound),
        };
        // No `require_auth` here — see function doc.
        if !sub.active {
            panic_with_error!(&env, SubscriptionError::Inactive);
        }
        if env.ledger().timestamp() < sub.next_payment {
            panic_with_error!(&env, SubscriptionError::NotDue);
        }

        // Overflow-safe scheduling of the next cycle.
        let new_next_payment = sub
            .next_payment
            .checked_add(sub.interval)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));

        // Checks-effects-interactions — commit all state changes BEFORE
        // the external token call, so a malicious (subscriber-supplied) token
        // contract cannot reenter `trigger` and double-pull the current cycle.
        let token_addr = sub.token.clone();
        let subscriber = sub.subscriber.clone();
        let recipient = sub.recipient.clone();
        let amount = sub.amount;
        sub.next_payment = new_next_payment;
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Sub(id), TTL_MIN, TTL_BUMP);

        let client = token::Client::new(&env, &token_addr);
        client.transfer_from(
            &env.current_contract_address(),
            &subscriber,
            &recipient,
            &amount,
        );

        Trigger {
            id,
            subscriber,
            recipient,
            amount,
        }
        .publish(&env);
    }

    /// Batch-catch up to `count` consecutive due cycles in a single tx.
    ///
    /// The contract processes `min(count, due_cycles)` where
    /// `due_cycles = (now - next_payment) / interval + 1`, advances
    /// `next_payment` by the corresponding amount of intervals (no drift),
    /// and pulls `cycles_processed * amount` from the subscriber in a single
    /// `transfer_from`. Useful for keepers/recipients catching up after a
    /// pause window or downtime.
    ///
    /// Like `trigger`, this is permissionless — the subscriber's allowance
    /// (which must cover the total amount) is the consent.
    pub fn trigger_n(env: Env, id: u64, count: u32) {
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        Self::require_not_paused(&env);
        if count == 0 {
            panic_with_error!(&env, SubscriptionError::InvalidCount);
        }
        let mut sub: Subscription = match env.storage().persistent().get(&DataKey::Sub(id)) {
            Some(s) => s,
            None => panic_with_error!(&env, SubscriptionError::NotFound),
        };
        if !sub.active {
            panic_with_error!(&env, SubscriptionError::Inactive);
        }
        let now = env.ledger().timestamp();
        if now < sub.next_payment {
            panic_with_error!(&env, SubscriptionError::NotDue);
        }

        // How many cycles are actually due as of `now`? Subtraction is safe
        // by the `now >= next_payment` check above; division is safe because
        // `interval >= 1` is enforced at creation. Both are written with
        // checked arithmetic so any future invariant change cannot silently
        // wrap or panic.
        let elapsed = now
            .checked_sub(sub.next_payment)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        let due_cycles: u64 = elapsed
            .checked_div(sub.interval)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow))
            .checked_add(1)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        let cycles: u64 = (count as u64).min(due_cycles);

        // Style overflow guards on every arithmetic step.
        let advance = cycles
            .checked_mul(sub.interval)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        let new_next_payment = sub
            .next_payment
            .checked_add(advance)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));
        let total_amount: i128 = sub
            .amount
            .checked_mul(cycles as i128)
            .unwrap_or_else(|| panic_with_error!(&env, SubscriptionError::ArithmeticOverflow));

        // CEI: commit state BEFORE the external call.
        let token_addr = sub.token.clone();
        let subscriber = sub.subscriber.clone();
        let recipient = sub.recipient.clone();
        sub.next_payment = new_next_payment;
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Sub(id), TTL_MIN, TTL_BUMP);

        let client = token::Client::new(&env, &token_addr);
        client.transfer_from(
            &env.current_contract_address(),
            &subscriber,
            &recipient,
            &total_amount,
        );

        TriggerN {
            id,
            subscriber,
            recipient,
            total_amount,
            cycles,
        }
        .publish(&env);
    }

    /// Cancel a subscription. Only the subscriber can cancel.
    pub fn cancel(env: Env, id: u64) {
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        let mut sub: Subscription = match env.storage().persistent().get(&DataKey::Sub(id)) {
            Some(s) => s,
            None => panic_with_error!(&env, SubscriptionError::NotFound),
        };
        sub.subscriber.require_auth();
        sub.active = false;
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
        env.storage().persistent().extend_ttl(&DataKey::Sub(id), TTL_MIN, TTL_BUMP);
        // Frontends listening for this event should prompt the subscriber to
        // revoke their token allowance: token.approve(contract_address, 0)
        Cancel {
            id,
            subscriber: sub.subscriber.clone(),
        }
        .publish(&env);
    }

    /// Read a subscription by id.
    pub fn get(env: Env, id: u64) -> Subscription {
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
        match env.storage().persistent().get(&DataKey::Sub(id)) {
            Some(s) => s,
            None => panic_with_error!(&env, SubscriptionError::NotFound),
        }
    }

    fn require_owner(env: &Env) {
        let owner: Address = match env.storage().persistent().get(&DataKey::Owner) {
            Some(o) => o,
            None => panic_with_error!(env, SubscriptionError::NotInitialized),
        };
        owner.require_auth();
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Owner, TTL_MIN, TTL_BUMP);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, TTL_MIN, TTL_BUMP);
        env.storage().instance().extend_ttl(TTL_MIN, TTL_BUMP);
    }

    /// Fail-closed paused check.
    ///
    /// A missing `Paused` entry is treated as `NotInitialized` rather than
    /// defaulting to `false`. Combined with persistent storage, this means
    /// that even if the governance state were somehow lost — archive
    /// expiry, migration bug — the contract will refuse to pull tokens
    /// rather than silently revert to "unpaused" while no admin can fix it.
    ///
    /// Both governance keys (`Paused` and `Owner`) have their TTL bumped on
    /// every successful call so that normal user activity (create / trigger /
    /// trigger_n) keeps them alive without requiring periodic admin touch.
    fn require_not_paused(env: &Env) {
        let paused: bool = match env.storage().persistent().get(&DataKey::Paused) {
            Some(p) => p,
            None => panic_with_error!(env, SubscriptionError::NotInitialized),
        };
        if paused {
            panic_with_error!(env, SubscriptionError::ContractPaused);
        }
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, TTL_MIN, TTL_BUMP);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Owner, TTL_MIN, TTL_BUMP);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::{token::StellarAssetClient, Env};

    fn setup() -> (Env, SubscriptionContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let contract_id = env.register(SubscriptionContract, (owner.clone(),));
        let client = SubscriptionContractClient::new(&env, &contract_id);
        (env, client, owner)
    }

    fn deploy_token(env: &Env, admin: &Address) -> Address {
        let token_id = env
            .register_stellar_asset_contract_v2(admin.clone())
            .address();
        let token_admin = StellarAssetClient::new(env, &token_id);
        token_admin.mint(admin, &1_000_000_000);
        token_id
    }

    /// Grant the subscription contract an allowance so trigger can pull funds.
    fn approve(
        env: &Env,
        token_id: &Address,
        subscriber: &Address,
        spender: &Address,
        amount: i128,
    ) {
        let token_client = token::Client::new(env, token_id);
        // Allowance expires far in the future (ledger sequence 10_000).
        token_client.approve(subscriber, spender, &amount, &10_000);
    }

    #[test]
    fn test_create_returns_id() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        assert_eq!(id, 1);
    }

    #[test]
    fn test_get_subscription() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &250, &7200);
        let sub = client.get(&id);
        assert!(sub.active);
        assert_eq!(sub.amount, 250);
        assert_eq!(sub.interval, 7200);
    }

    #[test]
    fn test_cancel_subscription() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        client.cancel(&id);
        let sub = client.get(&id);
        assert!(!sub.active);
    }

    #[test]
    fn test_trigger_after_interval() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);

        let id = client.create(&subscriber, &token, &recipient, &100, &3600);

        // Grant the subscription contract the right to pull tokens on behalf of
        // the subscriber (simulates real-world approve flow).
        approve(&env, &token, &subscriber, &client.address, 1_000_000);

        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger(&id);

        let sub = client.get(&id);
        assert!(sub.next_payment > env.ledger().timestamp());
    }

    #[test]
    #[should_panic]
    fn test_pause_prevents_create() {
        let (env, client, _owner) = setup();
        client.pause();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        client.create(&subscriber, &token, &recipient, &100, &3600);
    }

    #[test]
    #[should_panic]
    fn test_pause_prevents_trigger() {
        let (env, client, _owner) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.pause();
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger(&id);
    }

    #[test]
    fn test_unpause_allows_trigger() {
        let (env, client, _owner) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.pause();
        client.unpause();
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger(&id);
        let sub = client.get(&id);
        assert!(sub.next_payment > env.ledger().timestamp());
    }

    /// `trigger` is permissionless. The allowance carries the
    /// subscriber's consent and the recipient is fixed at creation, so a
    /// call with the auth whitelist cleared (no user signature) must succeed.
    #[test]
    fn test_trigger_is_permissionless() {
        let env = Env::default();
        env.mock_all_auths();
        let owner = Address::generate(&env);
        let contract_id = env.register(SubscriptionContract, (owner.clone(),));
        let client = SubscriptionContractClient::new(&env, &contract_id);
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        // Drop the auth whitelist: no recipient / subscriber signature is
        // provided. The allowance alone must suffice.
        env.mock_auths(&[]);
        client.trigger(&id);
        let sub = client.get(&id);
        assert!(sub.active);
        assert_eq!(sub.next_payment, 3600u64 + 3600u64);
    }

    #[test]
    #[should_panic]
    fn test_create_zero_amount_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        client.create(&subscriber, &token, &recipient, &0, &3600);
    }

    #[test]
    #[should_panic]
    fn test_create_negative_amount_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        client.create(&subscriber, &token, &recipient, &-1, &3600);
    }

    #[test]
    #[should_panic]
    fn test_create_zero_interval_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        client.create(&subscriber, &token, &recipient, &100, &0);
    }

    #[test]
    fn test_trigger_no_drift() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);

        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);

        // Trigger avec 2× l'intervalle de retard — next_payment doit rester ancré sur le schedule
        env.ledger().with_mut(|l| l.timestamp += 7300);
        let scheduled = client.get(&id).next_payment; // = 3600 (timestamp initial + interval)
        client.trigger(&id);

        let sub = client.get(&id);
        // Doit être scheduled + interval (3600 + 3600 = 7200), PAS now + interval (7300 + 3600 = 10900)
        assert_eq!(sub.next_payment, scheduled + 3600);
    }

    #[test]
    #[should_panic]
    fn test_trigger_before_due_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        // Aucune avance de temps — doit paniquer avec NotDue
        client.trigger(&id);
    }

    // ========== Interval bound & overflow regression ==========

    /// Interval above `MAX_INTERVAL` (10 years) is rejected.
    #[test]
    #[should_panic]
    fn test_create_interval_too_large_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let too_large: u64 = 10 * 365 * 24 * 60 * 60 + 1;
        client.create(&subscriber, &token, &recipient, &100, &too_large);
    }

    /// Exactly `MAX_INTERVAL` is accepted (boundary condition).
    #[test]
    fn test_create_interval_at_max_bound_succeeds() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let max: u64 = 10 * 365 * 24 * 60 * 60;
        let id = client.create(&subscriber, &token, &recipient, &100, &max);
        assert_eq!(id, 1);
    }

    /// `u64::MAX` interval would overflow `next_payment` at creation
    /// — the interval bound check catches it before `checked_add` is reached.
    #[test]
    #[should_panic]
    fn test_create_interval_u64_max_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        client.create(&subscriber, &token, &recipient, &100, &u64::MAX);
    }

    // ========== Lifecycle invariants ==========

    /// A cancelled subscription must refuse further triggers.
    #[test]
    #[should_panic]
    fn test_trigger_after_cancel_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.cancel(&id);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger(&id);
    }

    /// Cancelling twice is idempotent — the second call must not panic.
    #[test]
    fn test_double_cancel_is_idempotent() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        client.cancel(&id);
        client.cancel(&id);
        let sub = client.get(&id);
        assert!(!sub.active);
    }

    // ========== Persistent counter ==========

    /// Subscription IDs increment strictly and never collide.
    #[test]
    fn test_counter_increments_monotonically() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id1 = client.create(&subscriber, &token, &recipient, &100, &3600);
        let id2 = client.create(&subscriber, &token, &recipient, &200, &3600);
        let id3 = client.create(&subscriber, &token, &recipient, &300, &3600);
        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(id3, 3);
    }

    // ========== Ownership transfer ==========

    /// Happy path: a transfer carrying both signatures (mock_all_auths)
    /// rotates ownership in a single transaction.
    #[test]
    fn test_transfer_ownership_succeeds() {
        let (env, client, _owner) = setup();
        let new_owner = Address::generate(&env);
        client.transfer_ownership(&new_owner);
        // The new owner (via mock_all_auths) can immediately exercise
        // owner-only entrypoints.
        client.pause();
        client.unpause();
    }

    /// `transfer_ownership` without the current owner's auth must fail.
    #[test]
    #[should_panic]
    fn test_transfer_ownership_without_owner_auth_fails() {
        let (env, client, _owner) = setup();
        let attacker = Address::generate(&env);
        env.mock_auths(&[]);
        client.transfer_ownership(&attacker);
    }

    /// `transfer_ownership` must also reject a tx where only the current
    /// owner signed but the new owner did not — this is the scout-audit
    /// regression for the *missing_new_admin_auth* finding.
    #[test]
    #[should_panic]
    fn test_transfer_ownership_without_new_owner_auth_fails() {
        use soroban_sdk::testutils::{MockAuth, MockAuthInvoke};
        use soroban_sdk::IntoVal;
        let (env, client, owner) = setup();
        let new_owner = Address::generate(&env);
        env.mock_auths(&[MockAuth {
            address: &owner,
            invoke: &MockAuthInvoke {
                contract: &client.address,
                fn_name: "transfer_ownership",
                args: (new_owner.clone(),).into_val(&env),
                sub_invokes: &[],
            },
        }]);
        client.transfer_ownership(&new_owner);
    }

    // ========== Address validation in create ==========

    #[test]
    #[should_panic]
    fn test_create_recipient_is_contract_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let self_addr = client.address.clone();
        client.create(&subscriber, &token, &self_addr, &100, &3600);
    }

    #[test]
    #[should_panic]
    fn test_create_token_is_contract_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let self_addr = client.address.clone();
        client.create(&subscriber, &self_addr, &recipient, &100, &3600);
    }

    // ========== Upgrade authorization ==========

    /// `upgrade` must reject any caller that is not the current owner.
    #[test]
    #[should_panic]
    fn test_upgrade_requires_owner() {
        let (env, client, _owner) = setup();
        let dummy = BytesN::from_array(&env, &[0u8; 32]);
        env.mock_auths(&[]);
        client.upgrade(&dummy);
    }

    // ========== Admin-auth regression ==========

    /// `pause` must reject any caller that is not the current owner.
    #[test]
    #[should_panic]
    fn test_pause_without_owner_auth_fails() {
        let (env, client, _owner) = setup();
        env.mock_auths(&[]);
        client.pause();
    }

    // ========== Governance state fail-closed (Almanax MEDIUM) ==========

    /// Regression for the *instance TTL expiry bypass pause* finding.
    ///
    /// Simulates the scenario where the `Paused` entry is lost (archive
    /// expiry, migration bug, etc.). With the previous design — `Paused`
    /// in instance storage, read as `unwrap_or(false)` — the contract
    /// would have silently defaulted to *unpaused* and let `trigger` pull
    /// tokens again while the owner was unable to intervene.
    ///
    /// After the fix (persistent storage + fail-closed read), any
    /// payment-moving entrypoint must panic when `Paused` is missing.
    #[test]
    #[should_panic]
    fn test_trigger_fails_closed_when_paused_entry_missing() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);

        // Directly remove the persistent `Paused` entry from the contract's
        // storage to simulate a lost governance flag.
        env.as_contract(&client.address, || {
            env.storage().persistent().remove(&DataKey::Paused);
        });

        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger(&id);
    }

    /// `create` must also refuse to proceed when `Paused` is missing — the
    /// fail-closed check applies to every entrypoint that goes through
    /// `require_not_paused`.
    #[test]
    #[should_panic]
    fn test_create_fails_closed_when_paused_entry_missing() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);

        env.as_contract(&client.address, || {
            env.storage().persistent().remove(&DataKey::Paused);
        });

        client.create(&subscriber, &token, &recipient, &100, &3600);
    }

    /// If the `Owner` entry is missing, admin entrypoints must panic with
    /// `NotInitialized` rather than silently accept the caller.
    #[test]
    #[should_panic]
    fn test_pause_fails_when_owner_entry_missing() {
        let (env, client, _) = setup();

        env.as_contract(&client.address, || {
            env.storage().persistent().remove(&DataKey::Owner);
        });

        client.pause();
    }

    // ========== Batch trigger ==========

    /// `trigger_n` catches up multiple due cycles atomically.
    /// At `now = 12600` with anchors at 3600/7200/10800/14400, three anchors
    /// have passed (3 cycles due); 14400 is still in the future. With
    /// `count = 10`, all 3 are processed and `next_payment` advances to 14400.
    #[test]
    fn test_trigger_n_catches_up_multiple_cycles() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 3 * 3600 + 1800);
        client.trigger_n(&id, &10);
        let sub = client.get(&id);
        assert_eq!(sub.next_payment, 3600 + 3 * 3600);
    }

    /// `count` higher than `due_cycles` is silently capped at `due_cycles`.
    #[test]
    fn test_trigger_n_caps_at_due_cycles() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger_n(&id, &50);
        let sub = client.get(&id);
        assert_eq!(sub.next_payment, 3600 + 3600);
    }

    /// `trigger_n(id, 1)` is functionally equivalent to `trigger(id)`.
    #[test]
    fn test_trigger_n_one_matches_trigger() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger_n(&id, &1);
        let sub = client.get(&id);
        assert_eq!(sub.next_payment, 3600 + 3600);
    }

    /// `count == 0` is rejected with `InvalidCount`.
    #[test]
    #[should_panic]
    fn test_trigger_n_zero_count_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger_n(&id, &0);
    }

    /// Before any cycle is due, `trigger_n` panics with `NotDue`.
    #[test]
    #[should_panic]
    fn test_trigger_n_before_due_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.trigger_n(&id, &5);
    }

    /// Cancelled subscriptions refuse `trigger_n`.
    #[test]
    #[should_panic]
    fn test_trigger_n_after_cancel_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.cancel(&id);
        env.ledger().with_mut(|l| l.timestamp += 3601);
        client.trigger_n(&id, &5);
    }

    /// Pause blocks `trigger_n`.
    #[test]
    #[should_panic]
    fn test_trigger_n_when_paused_fails() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        client.pause();
        env.ledger().with_mut(|l| l.timestamp += 3 * 3600 + 1800);
        client.trigger_n(&id, &5);
    }

    /// `trigger_n` is permissionless — like `trigger`, no recipient signature.
    #[test]
    fn test_trigger_n_is_permissionless() {
        let (env, client, _) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        approve(&env, &token, &subscriber, &client.address, 1_000_000);
        env.ledger().with_mut(|l| l.timestamp += 7200);
        env.mock_auths(&[]);
        client.trigger_n(&id, &10);
        let sub = client.get(&id);
        assert_eq!(sub.next_payment, 3600 + 2 * 3600);
    }
}
