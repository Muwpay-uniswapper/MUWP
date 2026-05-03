import {
	type Web3ProviderBackend,
	Web3RequestKind,
} from "headless-web3-provider";
import { expect, test } from "./fixtures";

let wallet: Web3ProviderBackend;

// TODO: Réécrire ces tests avec un mock connector wagmi ou Synpress.
// Raison du skip : l'app utilise ConnectKit + wagmi v2. Le bouton "MetaMask"
// du modal passe par MetaMask SDK (deep-link / WalletConnect) et n'utilise
// pas window.ethereum, donc `headless-web3-provider` n'est jamais sollicité.
// Pattern moderne recommandé :
//   - dev/test : wagmi `mock()` connector, gated par NEXT_PUBLIC_E2E=1
//   - full Web3 : Synpress (extension MetaMask réelle) + Anvil fork
test.skip(
	true,
	"Obsolète : incompatible avec ConnectKit + MetaMask SDK. Voir TODO ci-dessus.",
);

test.beforeEach(async ({ page, injectWeb3Provider, accounts }) => {
	// Inject window.ethereum instance
	wallet = await injectWeb3Provider();

	await page.addInitScript(() => (window.ethereum.isMetaMask = true));

	await page.goto("/?chain=137&toChain=42161");

	// Until the wallet is connected, the accounts should be empty
	let ethAccounts = await page.evaluate(() =>
		window.ethereum.request({ method: "eth_accounts", params: [] }),
	);
	expect(ethAccounts).toEqual([]);

	await page.click("text=Connect Wallet");
	await page.click("text=MetaMask");

	// Wait until the wallet receives the RequestAccounts request
	await expect
		.poll(
			() => wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts),
			{ timeout: 5000 },
		)
		.toBeGreaterThan(0);

	// You can either authorize or reject the request
	await wallet.authorize(Web3RequestKind.RequestAccounts);

	// Wait until the pending request count returns to 0 after authorization
	await expect
		.poll(
			() => wallet.getPendingRequestCount(Web3RequestKind.RequestAccounts),
			{ timeout: 5000 },
		)
		.toEqual(0);

	// After connecting the wallet, the accounts should be available
	ethAccounts = await page.evaluate(() =>
		window.ethereum.request({ method: "eth_accounts", params: [] }),
	);
	expect(ethAccounts).toEqual(accounts);
});

test("Multiple to One", async ({ page }) => {
	await page.click("#input-token-combo-0");
	await page.click('text="MATIC"');
	await page.locator("#input-token-combo-0").getByRole("textbox").fill("100");
	await page.click("#input-token-combo-1");
	await page.click('text="USDT"');
	await page.locator("#input-token-combo-1").getByRole("textbox").fill("150");

	await page.click("#output-token-combo-0");
	await page.click('text="ETH"');

	await page.click("text=Find Routes");
	await page.waitForEvent("console", (msg) => msg.text() === "Routes fetched");

	// Check if the button "Approve" is visible
	await expect(page.locator(".swapbutton")).not.toBeDisabled();
	await expect(page.locator(".swapbutton")).toHaveText("Approve");
});

test("One to Multiple", async ({ page }) => {
	await page.click("#input-token-combo-0");
	await page.click('text="MATIC"');
	await page.locator("#input-token-combo-0").getByRole("textbox").fill("120");

	await page.click("#output-token-combo-0");
	await page.click('text="USDT"');
	await page.click("#output-token-combo-1");
	await page.click('text="ETH"');

	await page.click("text=Find Routes");
	await page.waitForEvent("console", (msg) => msg.text() === "Routes fetched");

	// Check if the button "Approve" is visible
	await expect(page.locator(".swapbutton")).not.toBeDisabled();
	await expect(page.locator(".swapbutton")).toHaveText("Review");
});
