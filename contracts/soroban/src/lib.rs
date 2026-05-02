#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

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
}

#[contract]
pub struct SubscriptionContract;

#[contractimpl]
impl SubscriptionContract {
    /// Create a new recurring subscription.
    ///
    /// The subscriber must have approved (via token.approve) the contract
    /// address as a spender for at least `amount` tokens before each payment.
    /// In production this is done once with a large enough allowance; in tests
    /// we call approve in the test helper and mock_all_auths covers it.
    pub fn create(
        env: Env,
        subscriber: Address,
        token: Address,
        recipient: Address,
        amount: i128,
        interval: u64,
    ) -> u64 {
        subscriber.require_auth();
        let id: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0) + 1;
        env.storage().instance().set(&DataKey::Counter, &id);
        let sub = Subscription {
            subscriber,
            token,
            recipient,
            amount,
            interval,
            next_payment: env.ledger().timestamp() + interval,
            active: true,
        };
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
        id
    }

    /// Trigger the next payment for subscription `id`.
    ///
    /// Anyone can call this once the payment is due. The token is pulled from
    /// the subscriber via `transfer_from`, so the subscriber must have granted
    /// a sufficient allowance to this contract address beforehand.
    pub fn trigger(env: Env, id: u64) {
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&DataKey::Sub(id))
            .expect("subscription not found");
        assert!(sub.active, "subscription inactive");
        assert!(
            env.ledger().timestamp() >= sub.next_payment,
            "payment not due yet"
        );

        let client = token::Client::new(&env, &sub.token);
        // Pull tokens from subscriber using transfer_from (spender = this contract).
        client.transfer_from(
            &env.current_contract_address(),
            &sub.subscriber,
            &sub.recipient,
            &sub.amount,
        );

        sub.next_payment = env.ledger().timestamp() + sub.interval;
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
    }

    /// Cancel a subscription. Only the subscriber can cancel.
    pub fn cancel(env: Env, id: u64) {
        let mut sub: Subscription = env
            .storage()
            .persistent()
            .get(&DataKey::Sub(id))
            .expect("subscription not found");
        sub.subscriber.require_auth();
        sub.active = false;
        env.storage().persistent().set(&DataKey::Sub(id), &sub);
    }

    /// Read a subscription by id.
    pub fn get(env: Env, id: u64) -> Subscription {
        env.storage()
            .persistent()
            .get(&DataKey::Sub(id))
            .expect("subscription not found")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};
    use soroban_sdk::{token::StellarAssetClient, Env};

    fn setup() -> (Env, SubscriptionContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, SubscriptionContract);
        let client = SubscriptionContractClient::new(&env, &contract_id);
        (env, client)
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
        let (env, client) = setup();
        let subscriber = Address::generate(&env);
        let recipient = Address::generate(&env);
        let token = deploy_token(&env, &subscriber);
        let id = client.create(&subscriber, &token, &recipient, &100, &3600);
        assert_eq!(id, 1);
    }

    #[test]
    fn test_get_subscription() {
        let (env, client) = setup();
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
        let (env, client) = setup();
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
        let (env, client) = setup();
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
}
