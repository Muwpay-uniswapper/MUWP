---
description: Developer API to use MUWP programatically.
---

# API Reference



{% hint style="info" %}
The base URL for the api is `https://muwp.xyz`
{% endhint %}

#### Quote

Use this endpoint to retrieve quotes from our system

`POST /api/quote`

| Name          | Type             | Required | Description                                    |
| ------------- | ---------------- | -------- | ---------------------------------------------- |
| `inputTokens` | `Array<Token>`   | Yes      | Array of input tokens, minimum of 1 required.  |
| `outputToken` | `Token`          | Yes      | Output token.                                  |
| `inputChain`  | `number`         | Yes      | Input blockchain identifier.                   |
| `outputChain` | `number`         | Yes      | Output blockchain identifier.                  |
| `inputAmount` | `Record<bigint>` | Yes      | The amount of input tokens.                    |
| `fromAddress` | `Address`        | Yes      | The sender's blockchain address.               |
| `tempAccount` | `Address`        | No       | Temporary account address (optional).          |
| `toAddress`   | `Address`        | No       | The recipient's blockchain address (optional). |
| `options`     | `RouteOptions`   | No       | Options for the routing process (optional).    |

Returns an object containing:

• ﻿`routes` (`Array<Route>`): Array of possible routes for the transaction.

• `tempAccount` (`Address`): The temporary account address, retrieved directly from the input.

• ﻿`validUntil` (`number`): A Unix timestamp specifying when the quote expires. This is typically the current time + (1000 ms \* 60 secs \* 5 mins).

#### Initiate

Use this endpoint to initiate a MUWP swap.

`POST /api/initiate`

| Name                   | Type           | Required | Description                                          |
| ---------------------- | -------------- | -------- | ---------------------------------------------------- |
| `from`                 | `Address`      | Yes      | Origin address of the transaction.                   |
| `account`              | `Address`      | Yes      | Account initiating the transaction.                  |
| `chainId`              | `number`       | Yes      | Blockchain network identifier.                       |
| `routes`               | `Array<Route>` | Yes      | Array of routes for the transaction.                 |
| `maxFeePerGas`         | `bigint`       | No       | Maximum gas fee per transaction (optional).          |
| `maxPriorityFeePerGas` | `bigint`       | No       | Maximum priority gas fee per transaction (optional). |

Returns an object containing:

• `status` (`string`): Indicates the transaction's status.

• ﻿`address` (`Address`): The account initiating the transaction, retrieved directly from the input.

• ﻿`txn` (`Transaction`): The transaction data.

• ﻿`id` (`string`): The ID of the initiating account.

#### Receive Funds

Use this endpoint to notify the system that the user has sent his funds, but the transaction hasn't been mined yet.

`POST /api/receive-funds`

| Name              | Type      | Required | Description                                       |
| ----------------- | --------- | -------- | ------------------------------------------------- |
| `transactionHash` | `Hash`    | Yes      | The transaction hash of the funds being received. |
| `chainId`         | `number`  | Yes      | Identifier for the blockchain network.            |
| `accountAddress`  | `Address` | Yes      | Address of the account receiving funds.           |

Returns an object containing:

• ﻿`status` (`string`): Indicates the status of funds received.

#### Chain Confirmed

Use this endpoint to notify the system that the transaction has been mined and included in the chain.

`POST /api/chain-confirmed`

| Name              | Type      | Required | Description                                       |
| ----------------- | --------- | -------- | ------------------------------------------------- |
| `transactionHash` | `Hash`    | Yes      | The transaction hash of the funds being received. |
| `chainId`         | `number`  | Yes      | Identifier for the blockchain network.            |
| `accountAddress`  | `Address` | Yes      | Address of the account receiving funds.           |

Returns an object containing:

• ﻿`status` (`string`): Indicates the status of funds received.
