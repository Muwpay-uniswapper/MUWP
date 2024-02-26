import { test, expect } from './fixtures'
import { Web3ProviderBackend, Web3RequestKind } from 'headless-web3-provider'

let wallet: Web3ProviderBackend

test.beforeEach(async ({ page, injectWeb3Provider, accounts }) => {
    // Inject window.ethereum instance
    wallet = await injectWeb3Provider()

    await page.addInitScript(() => (window.ethereum.isMetaMask = true))

    await page.goto('http://localhost:3000/?chain=137&toChain=42161');

    // Until the wallet is connected, the accounts should be empty
    let ethAccounts = await page.evaluate(() =>
        window.ethereum.request({ method: 'eth_accounts', params: [] })
    )
    expect(ethAccounts).toEqual([]);

    await page.click('text=Connect Wallet');
    await page.click('text=MetaMask');

    // Wait until the pending request count is more than 0 to continue
    await page.waitForTimeout(100);

    expect(
        wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts)
    ).toBeGreaterThan(0)

    // You can either authorize or reject the request
    await wallet.authorize(Web3RequestKind.RequestAccounts)

    // Ensure the pending request count returns to 0 after authorization
    await page.waitForTimeout(100);

    expect(
        wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts)
    ).toEqual(0)

    // After connecting the wallet, the accounts should be available
    ethAccounts = await page.evaluate(() =>
        window.ethereum.request({ method: 'eth_accounts', params: [] })
    )
    expect(ethAccounts).toEqual(accounts)
})

test('Multiple to One', async ({ page }) => {
    await page.click('text=Select Token');
    await page.click('text="MATIC"');
    await page.locator("#input-token-combo-0").getByRole("textbox").fill("0.1");
    await page.click('text=Select Token');
    await page.click('text="USDT"');
    await page.locator("#input-token-combo-1").getByRole("textbox").fill("150");

    await page.click('#output-token-combo-0');
    await page.click('text="ETH"');

    await page.click('text=Find Routes');
    await page.waitForEvent("console", (msg) => msg.text() === "Routes fetched");

    // Check if the button "Approve" is visible
    await expect(page.locator(".swapbutton")).not.toBeDisabled();
    await expect(page.locator(".swapbutton")).toHaveText("Approve");
});

test('One to Multiple', async ({ page }) => {
    await page.click('text=Select Token');
    await page.click('text="MATIC"');
    await page.locator("#input-token-combo-0").getByRole("textbox").fill("1");

    await page.click('#output-token-combo-0');
    await page.click('text="USDT"');
    await page.click('#output-token-combo-1');
    await page.click('text="ETH"');

    await page.click('text=Find Routes');
    await page.waitForEvent("console", (msg) => msg.text() === "Routes fetched");

    // Check if the button "Approve" is visible
    await expect(page.locator(".swapbutton")).not.toBeDisabled();
    await expect(page.locator(".swapbutton")).toHaveText("Review");
});