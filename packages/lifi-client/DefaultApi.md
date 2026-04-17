# .DefaultApi

All URIs are relative to *https://li.quest/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**analyticsTransfersGet**](DefaultApi.md#analyticsTransfersGet) | **GET** /analytics/transfers | Get a list of filtered transfers
[**analyticsWalletsWalletAddressGet**](DefaultApi.md#analyticsWalletsWalletAddressGet) | **GET** /analytics/wallets/{wallet_address} | Get all transactions for a wallet
[**calldataParseGet**](DefaultApi.md#calldataParseGet) | **GET** /calldata/parse | Parse transaction call data (BETA)
[**chainsGet**](DefaultApi.md#chainsGet) | **GET** /chains | Get information about all currently supported chains
[**connectionsGet**](DefaultApi.md#connectionsGet) | **GET** /connections | Returns all possible connections based on a from- or toChain.
[**gasRefetchGet**](DefaultApi.md#gasRefetchGet) | **GET** /gas/refetch | In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
[**gasStatusGet**](DefaultApi.md#gasStatusGet) | **GET** /gas/status | Get status information about a lifuel transaction
[**gasSuggestionChainGet**](DefaultApi.md#gasSuggestionChainGet) | **GET** /gas/suggestion/{chain} | Get a gas suggestion for the specified chain
[**integratorsIntegratorIdGet**](DefaultApi.md#integratorsIntegratorIdGet) | **GET** /integrators/{integratorId} | Get integrator\&#39;s collected fees data for all supported chains
[**integratorsIntegratorIdWithdrawChainIdGet**](DefaultApi.md#integratorsIntegratorIdWithdrawChainIdGet) | **GET** /integrators/{integratorId}/withdraw/{chainId} | Get transaction request for withdrawing collected integrator\&#39;s fees by chain
[**quoteContractCallPost**](DefaultApi.md#quoteContractCallPost) | **POST** /quote/contractCall | Perform a contract call across blockchains (BETA)
[**quoteContractCallsPost**](DefaultApi.md#quoteContractCallsPost) | **POST** /quote/contractCalls | Perform multiple contract calls across blockchains (BETA)
[**quoteGet**](DefaultApi.md#quoteGet) | **GET** /quote | Get a quote for a token transfer
[**statusGet**](DefaultApi.md#statusGet) | **GET** /status | Check the status of a cross chain transfer
[**tokenGet**](DefaultApi.md#tokenGet) | **GET** /token | Fetch information about a Token
[**tokensGet**](DefaultApi.md#tokensGet) | **GET** /tokens | Fetch all known tokens
[**toolsGet**](DefaultApi.md#toolsGet) | **GET** /tools | Get available bridges and exchanges


# **analyticsTransfersGet**
> any analyticsTransfersGet()

This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiAnalyticsTransfersGetRequest = {
  // string | The integrator string to filter by
  integrator: "integrator_example",
  // string | The sending OR receiving wallet address  (optional)
  wallet: "wallet_example",
  // string | The status of the transfers. Possible values are `ALL`, `DONE`, `PENDING`, and `FAILED`. The default is `DONE` (optional)
  status: "status_example",
  // number | The oldest timestamp that should be taken into consideration. Defaults to 30 days ago (optional)
  fromTimestamp: 3.14,
  // number | The newest timestamp that should be taken into consideration. Defaults to now (optional)
  toTimestamp: 3.14,
};

apiInstance.analyticsTransfersGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integrator** | [**string**] | The integrator string to filter by | defaults to undefined
 **wallet** | [**string**] | The sending OR receiving wallet address  | (optional) defaults to undefined
 **status** | [**string**] | The status of the transfers. Possible values are &#x60;ALL&#x60;, &#x60;DONE&#x60;, &#x60;PENDING&#x60;, and &#x60;FAILED&#x60;. The default is &#x60;DONE&#x60; | (optional) defaults to undefined
 **fromTimestamp** | [**number**] | The oldest timestamp that should be taken into consideration. Defaults to 30 days ago | (optional) defaults to undefined
 **toTimestamp** | [**number**] | The newest timestamp that should be taken into consideration. Defaults to now | (optional) defaults to undefined


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response of the /analtics/transfers endpoint |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **analyticsWalletsWalletAddressGet**
> WalletAnalyticsResponse analyticsWalletsWalletAddressGet()

This endpoint can be used to get all transactions for a wallet.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiAnalyticsWalletsWalletAddressGetRequest = {
  // string | The address of the wallet
  walletAddress: "wallet_address_example",
  // string | Filter the transactions by integrator
  integrator: "integrator_example",
  // number | A unix timestamp in seconds. No transaction older than this timestamp will be returned. (optional)
  fromTimestamp: 1,
  // number | A unix timestamp in seconds. No transaction newer than this timestamp will be returned. (optional)
  toTimestamp: 1,
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.analyticsWalletsWalletAddressGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **walletAddress** | [**string**] | The address of the wallet | defaults to undefined
 **integrator** | [**string**] | Filter the transactions by integrator | defaults to undefined
 **fromTimestamp** | [**number**] | A unix timestamp in seconds. No transaction older than this timestamp will be returned. | (optional) defaults to undefined
 **toTimestamp** | [**number**] | A unix timestamp in seconds. No transaction newer than this timestamp will be returned. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**WalletAnalyticsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Retrieve a list of transactions for a wallet address |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **calldataParseGet**
> void calldataParseGet()

This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiCalldataParseGetRequest = {
  // string | The call data to parse
  callData: "callData_example",
  // string | The chainId that the transaction is built for (or has been sent on) (optional)
  chainId: "chainId_example",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.calldataParseGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **callData** | [**string**] | The call data to parse | defaults to undefined
 **chainId** | [**string**] | The chainId that the transaction is built for (or has been sent on) | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | [     {         \&quot;functionName\&quot;: \&quot;swapTokensGeneric\&quot;,         \&quot;functionParameters\&quot;: {             \&quot;_transactionId\&quot;: \&quot;0x40b0592501720ece27ef8614385fbef4bdbb5b2050ebaaa3563e72fee959e249\&quot;,             \&quot;_integrator\&quot;: \&quot;jumper.exchange\&quot;,             \&quot;_referrer\&quot;: \&quot;0x0000000000000000000000000000000000000000\&quot;,             \&quot;_receiver\&quot;: \&quot;0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0\&quot;,             \&quot;_minAmount\&quot;: \&quot;4640629752435722515\&quot;,             \&quot;_swapData\&quot;: [                 {                     \&quot;callTo\&quot;: \&quot;0xDef1C0ded9bec7F1a1670819833240f027b25EfF\&quot;,                     \&quot;approveTo\&quot;: \&quot;0xDef1C0ded9bec7F1a1670819833240f027b25EfF\&quot;,                     \&quot;sendingAssetId\&quot;: \&quot;0x0000000000000000000000000000000000000000\&quot;,                     \&quot;receivingAssetId\&quot;: \&quot;0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063\&quot;,                     \&quot;fromAmount\&quot;: \&quot;5000000000000000000\&quot;,                     \&quot;callData\&quot;: \&quot;0x415565b0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000008f3cf7ad23cd3cadbd9735aff958023239c6a0630000000000000000000000000000000000000000000000004563918244f400000000000000000000000000000000000000000000000000004066d42c380a491300000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000004563918244f40000000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000008f3cf7ad23cd3cadbd9735aff958023239c6a06300000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000004563918244f40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000012556e69737761705633000000000000000000000000000000000000000000000000000000000000004563918244f400000000000000000000000000000000000000000000000000004066d42c380a4913000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000e592427a0aece92de3edee1f18e0157c058615640000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f48f3cf7ad23cd3cadbd9735aff958023239c6a063000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee0000000000000000000000000000000000000000000000000000000000000000869584cd00000000000000000000000026c16b6926637cf5eb62c42991b4166add66ff9e0000000000000000000000000000000000000000000000d3adebcfec6458a4f9\&quot;,                     \&quot;requiresDeposit\&quot;: true                 },                 {                     \&quot;callTo\&quot;: \&quot;0x464eF665Ea203d142F5aa25e12312290fA8917ec\&quot;,                     \&quot;approveTo\&quot;: \&quot;0x464eF665Ea203d142F5aa25e12312290fA8917ec\&quot;,                     \&quot;sendingAssetId\&quot;: \&quot;0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063\&quot;,                     \&quot;receivingAssetId\&quot;: \&quot;0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2\&quot;,                     \&quot;fromAmount\&quot;: \&quot;4640629752435722515\&quot;,                     \&quot;callData\&quot;: [                         {                             \&quot;functionName\&quot;: \&quot;upgrade\&quot;,                             \&quot;functionParameters\&quot;: {                                 \&quot;superToken\&quot;: \&quot;0x1305F6B6Df9Dc47159D12Eb7aC2804d4A33173c2\&quot;,                                 \&quot;account\&quot;: \&quot;0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE\&quot;,                                 \&quot;amount\&quot;: \&quot;4640629752435722515\&quot;                             }                         }                     ],                     \&quot;requiresDeposit\&quot;: false                 }             ]         }     } ] |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **chainsGet**
> ChainsResponse chainsGet()

If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiChainsGetRequest = {
  // string | Restrict the resulting tokens to the given chainTypes. (optional)
  chainTypes: "EVM,SVM",
  // string | The apiKey allows you to authenticate on the API. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.chainsGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chainTypes** | [**string**] | Restrict the resulting tokens to the given chainTypes. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | The apiKey allows you to authenticate on the API. | (optional) defaults to undefined


### Return type

**ChainsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **connectionsGet**
> ConnectionsResponse connectionsGet()

This endpoint gives information about all possible tranfers between chains. Since the result can be very large it is required to filter by at least a chain, a token, a bridge, or an exchange. Information about which chains and tokens are supported can be taken from the response of the /chains endpoint. Information about which bridges and exchanges are supported can be taken from the response of the /tools endpoint.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiConnectionsGetRequest = {
  // string | The chain that should be the start of the possible connections. (optional)
  fromChain: "POL",
  // string | The chain that should be the end of the possible connections. (optional)
  toChain: "toChain_example",
  // string | Only return connections starting with this token. (optional)
  fromToken: "DAI",
  // string | Only return connections ending with this token. (optional)
  toToken: "toToken_example",
  // string | Restrict the resulting tokens to the given chainTypes. (optional)
  chainTypes: "EVM,SVM",
  // Array<string> | List of bridges that are allowed for this transaction. Currently available bridges are for example `hop`, `multichain` or `connext`. All bridges can be loaded from the /tools endpoint. (optional)
  allowBridges: [
    "allowBridges_example",
  ],
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.connectionsGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fromChain** | [**string**] | The chain that should be the start of the possible connections. | (optional) defaults to undefined
 **toChain** | [**string**] | The chain that should be the end of the possible connections. | (optional) defaults to undefined
 **fromToken** | [**string**] | Only return connections starting with this token. | (optional) defaults to undefined
 **toToken** | [**string**] | Only return connections ending with this token. | (optional) defaults to undefined
 **chainTypes** | [**string**] | Restrict the resulting tokens to the given chainTypes. | (optional) defaults to undefined
 **allowBridges** | **Array&lt;string&gt;** | List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All bridges can be loaded from the /tools endpoint. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**ConnectionsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **gasRefetchGet**
> LIFuelStatus gasRefetchGet()


### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiGasRefetchGetRequest = {
  // string | The transaction hash that started the gas refilling process
  txHash: "0x74546ce8aac58d33c212474293dcfeeadecef115847da75131a2ff6692e03b96",
  // string | The chain where the deposit was originally made
  chainId: "POL",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.gasRefetchGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **txHash** | [**string**] | The transaction hash that started the gas refilling process | defaults to undefined
 **chainId** | [**string**] | The chain where the deposit was originally made | defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**LIFuelStatus**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | The status of a lifuel operation |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **gasStatusGet**
> LIFuelStatus gasStatusGet()


### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiGasStatusGetRequest = {
  // string | The transaction hash that started the gas refilling process
  txHash: "0x74546ce8aac58d33c212474293dcfeeadecef115847da75131a2ff6692e03b96",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.gasStatusGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **txHash** | [**string**] | The transaction hash that started the gas refilling process | defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**LIFuelStatus**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | The status of a lifuel operation |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **gasSuggestionChainGet**
> void gasSuggestionChainGet()

Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiGasSuggestionChainGetRequest = {
  // string | Chain from which gas prices should be shown (can be a chain id or a chain key)
  chain: "137",
  // string | If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain. (optional)
  fromChain: "100",
  // string | If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain. (optional)
  fromToken: "xDai",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.gasSuggestionChainGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | [**string**] | Chain from which gas prices should be shown (can be a chain id or a chain key) | defaults to undefined
 **fromChain** | [**string**] | If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain. | (optional) defaults to undefined
 **fromToken** | [**string**] | If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**void**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | {     \&quot;available\&quot;: true,     \&quot;recommended\&quot;: {         \&quot;token\&quot;: {             \&quot;address\&quot;: \&quot;0x0000000000000000000000000000000000000000\&quot;,             \&quot;chainId\&quot;: 137,             \&quot;symbol\&quot;: \&quot;MATIC\&quot;,             \&quot;decimals\&quot;: 18,             \&quot;name\&quot;: \&quot;MATIC\&quot;,             \&quot;priceUSD\&quot;: \&quot;1.219821\&quot;,             \&quot;logoURI\&quot;: \&quot;https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png\&quot;,             \&quot;coinKey\&quot;: \&quot;MATIC\&quot;         },         \&quot;amount\&quot;: \&quot;190510922050970750\&quot;,         \&quot;amountUsd\&quot;: \&quot;0.23\&quot;     },     \&quot;limit\&quot;: {         \&quot;token\&quot;: {             \&quot;address\&quot;: \&quot;0x0000000000000000000000000000000000000000\&quot;,             \&quot;chainId\&quot;: 137,             \&quot;symbol\&quot;: \&quot;MATIC\&quot;,             \&quot;decimals\&quot;: 18,             \&quot;name\&quot;: \&quot;MATIC\&quot;,             \&quot;priceUSD\&quot;: \&quot;1.219821\&quot;,             \&quot;logoURI\&quot;: \&quot;https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png\&quot;,             \&quot;coinKey\&quot;: \&quot;MATIC\&quot;         },         \&quot;amount\&quot;: \&quot;1639584824330782959\&quot;,         \&quot;amountUsd\&quot;: \&quot;2\&quot;     },     \&quot;serviceFee\&quot;: {         \&quot;token\&quot;: {             \&quot;address\&quot;: \&quot;0x0000000000000000000000000000000000000000\&quot;,             \&quot;chainId\&quot;: 137,             \&quot;symbol\&quot;: \&quot;MATIC\&quot;,             \&quot;decimals\&quot;: 18,             \&quot;name\&quot;: \&quot;MATIC\&quot;,             \&quot;priceUSD\&quot;: \&quot;1.219821\&quot;,             \&quot;logoURI\&quot;: \&quot;https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png\&quot;,             \&quot;coinKey\&quot;: \&quot;MATIC\&quot;         },         \&quot;amount\&quot;: \&quot;1829938819406250\&quot;,         \&quot;amountUsd\&quot;: \&quot;0.01\&quot;     },     \&quot;fromToken\&quot;: {         \&quot;address\&quot;: \&quot;eth\&quot;,         \&quot;symbol\&quot;: \&quot;ETH\&quot;,         \&quot;decimals\&quot;: 18,         \&quot;chainId\&quot;: 1,         \&quot;name\&quot;: \&quot;ETH\&quot;,         \&quot;coinKey\&quot;: \&quot;ETH\&quot;,         \&quot;priceUSD\&quot;: \&quot;1622.39\&quot;,         \&quot;logoURI\&quot;: \&quot;https://static.debank.com/image/token/logo_url/eth/935ae4e4d1d12d59a99717a24f2540b5.png\&quot;     },     \&quot;fromAmount\&quot;: \&quot;141766159801281\&quot; } |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **integratorsIntegratorIdGet**
> IntegratorResponse integratorsIntegratorIdGet()

This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiIntegratorsIntegratorIdGetRequest = {
  // string | Address or the name of the integrator that requests fee balances
  integratorId: "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.integratorsIntegratorIdGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integratorId** | [**string**] | Address or the name of the integrator that requests fee balances | defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**IntegratorResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response of the Integrator request |  -  |
**404** | Integrator with the name ${integratorId} is not found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **integratorsIntegratorIdWithdrawChainIdGet**
> IntegratorWithdrawalResponse integratorsIntegratorIdWithdrawChainIdGet()

This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiIntegratorsIntegratorIdWithdrawChainIdGetRequest = {
  // string | Address or the name of the integrator that requests fee withdrawal
  integratorId: "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0",
  // string | Specify chainId from which funds should be withdrawn
  chainId: "137",
  // Array<string> | Specify tokens from which funds should be withdraw (optional)
  tokenAddresses: ["0x0000000000000000000000000000000000000000"],
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.integratorsIntegratorIdWithdrawChainIdGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **integratorId** | [**string**] | Address or the name of the integrator that requests fee withdrawal | defaults to undefined
 **chainId** | [**string**] | Specify chainId from which funds should be withdrawn | defaults to undefined
 **tokenAddresses** | **Array&lt;string&gt;** | Specify tokens from which funds should be withdraw | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**IntegratorWithdrawalResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response of the integrator\&#39;s fee withdrawal transaction request |  -  |
**400** | None of the requested tokens has a balance |  -  |
**404** | Integrator with the name ${integratorId} is not found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **quoteContractCallPost**
> Tools quoteContractCallPost()

This endpoint has been deprecated in favour of /quote/contractCalls.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiQuoteContractCallPostRequest = {
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
  // ContractCallRequest | Object describing what tokens to transfer and how to interact with the destination contract. (optional)
  contractCallRequest: {
    fromChain: 3.14,
    fromToken: "fromToken_example",
    fromAddress: "fromAddress_example",
    toChain: 3.14,
    toToken: "toToken_example",
    toAmount: "toAmount_example",
    toContractAddress: "toContractAddress_example",
    contractOutputsToken: "contractOutputsToken_example",
    toContractCallData: "toContractCallData_example",
    toContractGasLimit: "toContractGasLimit_example",
    toApprovalAddress: "toApprovalAddress_example",
    toFallbackAddress: "toFallbackAddress_example",
    slippage: 3.14,
    integrator: "integrator_example",
    referrer: "referrer_example",
    allowBridges: [
      "allowBridges_example",
    ],
    denyBridges: [
      "denyBridges_example",
    ],
    preferBridges: [
      "preferBridges_example",
    ],
    allowExchanges: [
      "allowExchanges_example",
    ],
    denyExchanges: [
      "denyExchanges_example",
    ],
    preferExchanges: [
      "preferExchanges_example",
    ],
    maxPriceImpact: 3.14,
    allowDestinationCall: true,
  },
};

apiInstance.quoteContractCallPost(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **contractCallRequest** | **ContractCallRequest**| Object describing what tokens to transfer and how to interact with the destination contract. |
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**Tools**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Object listing all the currently enabled bridges and exchanges. |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **quoteContractCallsPost**
> Tools quoteContractCallsPost()

This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiQuoteContractCallsPostRequest = {
  // string | The apiKey allows you to authenticate on the API. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
  // ContractCallsRequest | Object describing what tokens to transfer and how to interact with the destination contracts. (optional)
  contractCallsRequest: {
    fromChain: 3.14,
    fromToken: "fromToken_example",
    fromAddress: "fromAddress_example",
    toChain: 3.14,
    toToken: "toToken_example",
    toAmount: "toAmount_example",
    contractCalls: [
      {
        fromAmount: "fromAmount_example",
        fromTokenAddress: "fromTokenAddress_example",
        toContractAddress: "toContractAddress_example",
        toContractCallData: "toContractCallData_example",
        toContractGasLimit: "toContractGasLimit_example",
        toApprovalAddress: "toApprovalAddress_example",
        toTokenAddress: "toTokenAddress_example",
      },
    ],
    toFallbackAddress: "toFallbackAddress_example",
    slippage: 3.14,
    integrator: "integrator_example",
    referrer: "referrer_example",
    allowBridges: [
      "allowBridges_example",
    ],
    denyBridges: [
      "denyBridges_example",
    ],
    preferBridges: [
      "preferBridges_example",
    ],
    allowExchanges: [
      "allowExchanges_example",
    ],
    denyExchanges: [
      "denyExchanges_example",
    ],
    preferExchanges: [
      "preferExchanges_example",
    ],
    maxPriceImpact: 3.14,
    allowDestinationCall: true,
  },
};

apiInstance.quoteContractCallsPost(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **contractCallsRequest** | **ContractCallsRequest**| Object describing what tokens to transfer and how to interact with the destination contracts. |
 **xLifiApiKey** | [**string**] | The apiKey allows you to authenticate on the API. | (optional) defaults to undefined


### Return type

**Tools**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Object listing all the currently enabled bridges and exchanges. |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **quoteGet**
> Step quoteGet()

This endpoint can be used to request a quote for a transfer of one token to another, cross chain or not. The endpoint returns a `Step` object which contains information about the estimated result as well as a `transactionRequest` which can directly be sent to your wallet. The estimated result can be found inside the `estimate`, containing the estimated `toAmount` of the requested `Token` and the `toAmountMin`, which is the guaranteed minimum value that the transfer will yield including slippage. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-a-quote).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiQuoteGetRequest = {
  // string | The sending chain. Can be the chain id or chain key
  fromChain: "DAI",
  // string | The receiving chain. Can be the chain id or chain key
  toChain: "POL",
  // string | The token that should be transferred. Can be the address or the symbol
  fromToken: "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
  // string | The token that should be transferred to. Can be the address or the symbol
  toToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  // string | The sending wallet address
  fromAddress: "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0",
  // string | The amount that should be sent including all decimals (e.g. 1000000 for 1 USDC (6 decimals))
  fromAmount: "1000000",
  // string | The receiving wallet address. If none is provided, the fromAddress will be used (optional)
  toAddress: "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0",
  // 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST' | Which kind of route should be preferred **RECOMMENDED**: This sorting criterion aims to find a balance between cost and complexity, prioritizing affordable and less complex routes. It first sorts routes based on their cost and then focuses on the top 5% of the routes. These top routes are ranked by considering both their cheapness and ease of use. **FASTEST**: This sorting criterion prioritizes routes with the shortest estimated execution time. Users who value speed and want their transactions to be completed as quickly as possible should choose the fastest routes. **CHEAPEST**: This criterion focuses on minimizing the cost of the transaction, whether in token amount or USD amount (USD amount minus gas cost). Users looking for the most economical option should choose the cheapest routes. **SAFEST**: Sorting by this criterion emphasizes the safety and reliability of the routes. Routes are ranked based on the safety level of the tools (bridges) used in their steps. Users who prioritize security and want to minimize risks associated with their transactions should choose the safest routes. If two routes have the same safety level, they are further ranked based on their speed. (optional)
  order: "RECOMMENDED",
  // number | The maximum allowed slippage for the transaction as a decimal value. 0.005 represents 0.5%. (optional)
  slippage: 0.005,
  // string | A string containing tracking information about the integrator of the API (optional)
  integrator: "your.site",
  // number | The percent of the integrator\'s fee that is taken from every transaction. 0.02 represents 2%. The maximum fee amount is 10%. (optional)
  fee: 0.02,
  // string | A string containing tracking information about the referrer of the integrator (optional)
  referrer: "referrer_example",
  // Array<QuoteBridgesEnum> | List of bridges that are allowed for this transaction. Currently available bridges are for example `hop`, `multichain` or `connext`. All supported bridges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  allowBridges: [
    "hop,cbridge",
  ],
  // Array<QuoteExchangesEnum> | List of exchanges that are allowed for this transaction. Currently available exchanges are aggregators such as `1inch`, `paraswap`, `openocean` and `0x` and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  allowExchanges: [
    "1inch",
  ],
  // Array<QuoteBridgesEnum> | List of bridges that are not allowed for this transaction. Currently available bridges are for example `hop`, `multichain` or `connext`. All supported bridges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  denyBridges: [
    "connext",
  ],
  // Array<QuoteExchangesEnum> | List of exchanges that are not allowed for this transaction. Currently available exchanges are aggregators such as `1inch`, `paraswap`, `openocean` and `0x` and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  denyExchanges: [
    "1inch",
  ],
  // Array<QuoteBridgesEnum> | List of bridges that should be preferred for this transaction. Currently available bridges are for example `hop`, `multichain` or `connext`. All supported bridges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  preferBridges: [
    "hop",
  ],
  // Array<QuoteExchangesEnum> | List of exchanges that should be preferred for this transaction. Currently available exchanges are aggregators such as `1inch`, `paraswap`, `openocean` and `0x` and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values `all`, `none`, `default` and `[]` are acceptable and mean all tools of the current type (`all`), no tools (for `none` and `[]` cases) and default tool\'s settings on the current stage. (optional)
  preferExchanges: [
    "1inch",
  ],
  // boolean | Whether swaps or other contract calls should be allowed as part of the destination transaction of a bridge transfer. Separate swap transactions on the destination chain are not affected by this flag. By default, parameter is `true`. (optional)
  allowDestinationCall: true,
  // number | The price impact threshold above which routes are hidden. As an example, one should specify 0.15 (15%) to hide routes with more than 15% price impact. The default is 10%. (optional)
  maxPriceImpact: 3.14,
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.quoteGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **fromChain** | [**string**] | The sending chain. Can be the chain id or chain key | defaults to undefined
 **toChain** | [**string**] | The receiving chain. Can be the chain id or chain key | defaults to undefined
 **fromToken** | [**string**] | The token that should be transferred. Can be the address or the symbol | defaults to undefined
 **toToken** | [**string**] | The token that should be transferred to. Can be the address or the symbol | defaults to undefined
 **fromAddress** | [**string**] | The sending wallet address | defaults to undefined
 **fromAmount** | [**string**] | The amount that should be sent including all decimals (e.g. 1000000 for 1 USDC (6 decimals)) | defaults to undefined
 **toAddress** | [**string**] | The receiving wallet address. If none is provided, the fromAddress will be used | (optional) defaults to undefined
 **order** | [**&#39;RECOMMENDED&#39; | &#39;FASTEST&#39; | &#39;CHEAPEST&#39; | &#39;SAFEST&#39;**]**Array<&#39;RECOMMENDED&#39; &#124; &#39;FASTEST&#39; &#124; &#39;CHEAPEST&#39; &#124; &#39;SAFEST&#39;>** | Which kind of route should be preferred **RECOMMENDED**: This sorting criterion aims to find a balance between cost and complexity, prioritizing affordable and less complex routes. It first sorts routes based on their cost and then focuses on the top 5% of the routes. These top routes are ranked by considering both their cheapness and ease of use. **FASTEST**: This sorting criterion prioritizes routes with the shortest estimated execution time. Users who value speed and want their transactions to be completed as quickly as possible should choose the fastest routes. **CHEAPEST**: This criterion focuses on minimizing the cost of the transaction, whether in token amount or USD amount (USD amount minus gas cost). Users looking for the most economical option should choose the cheapest routes. **SAFEST**: Sorting by this criterion emphasizes the safety and reliability of the routes. Routes are ranked based on the safety level of the tools (bridges) used in their steps. Users who prioritize security and want to minimize risks associated with their transactions should choose the safest routes. If two routes have the same safety level, they are further ranked based on their speed. | (optional) defaults to undefined
 **slippage** | [**number**] | The maximum allowed slippage for the transaction as a decimal value. 0.005 represents 0.5%. | (optional) defaults to undefined
 **integrator** | [**string**] | A string containing tracking information about the integrator of the API | (optional) defaults to undefined
 **fee** | [**number**] | The percent of the integrator\&#39;s fee that is taken from every transaction. 0.02 represents 2%. The maximum fee amount is 10%. | (optional) defaults to undefined
 **referrer** | [**string**] | A string containing tracking information about the referrer of the integrator | (optional) defaults to undefined
 **allowBridges** | **Array&lt;QuoteBridgesEnum&gt;** | List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **allowExchanges** | **Array&lt;QuoteExchangesEnum&gt;** | List of exchanges that are allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **denyBridges** | **Array&lt;QuoteBridgesEnum&gt;** | List of bridges that are not allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **denyExchanges** | **Array&lt;QuoteExchangesEnum&gt;** | List of exchanges that are not allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **preferBridges** | **Array&lt;QuoteBridgesEnum&gt;** | List of bridges that should be preferred for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **preferExchanges** | **Array&lt;QuoteExchangesEnum&gt;** | List of exchanges that should be preferred for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage. | (optional) defaults to undefined
 **allowDestinationCall** | [**boolean**] | Whether swaps or other contract calls should be allowed as part of the destination transaction of a bridge transfer. Separate swap transactions on the destination chain are not affected by this flag. By default, parameter is &#x60;true&#x60;. | (optional) defaults to undefined
 **maxPriceImpact** | [**number**] | The price impact threshold above which routes are hidden. As an example, one should specify 0.15 (15%) to hide routes with more than 15% price impact. The default is 10%. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**Step**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | The step populated with the transaction data |  -  |
**400** | Invalid quote request |  -  |
**404** | Unable to find a quote for the requested transfer. |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **statusGet**
> StatusResponse statusGet()

Cross chain transfers might take a while to complete. Waiting on the transaction on the sending chain doesn\'t help here. For this reason we build a simple endpoint that let\'s you check the status of your transfer. Important: The endpoint returns a `200` successful response even if the transaction can not be found. This behavior accounts for the case that the transaction hash is valid but the transaction has not been mined yet. While non of the parameters `fromChain`, `toChain` and `bridge` are required, passing the `fromChain` parameter will speed up the request and is therefore encouraged. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/checking-the-status-of-a-transaction).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiStatusGetRequest = {
  // string | The transaction hash on the sending chain
  txHash: "0x807e84fcea166e316742f811a47c464c02cc1f2cd176f514308244831cc67182",
  // BridgesEnum | The bridging tool used for the transfer (optional)
  bridge: "hop",
  // string | The sending chain. Can be the chain id or chain key (optional)
  fromChain: "ETH",
  // string | The receiving chain. Can be the chain id or chain key (optional)
  toChain: "ARB",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.statusGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **txHash** | [**string**] | The transaction hash on the sending chain | defaults to undefined
 **bridge** | **BridgesEnum** | The bridging tool used for the transfer | (optional) defaults to undefined
 **fromChain** | [**string**] | The sending chain. Can be the chain id or chain key | (optional) defaults to undefined
 **toChain** | [**string**] | The receiving chain. Can be the chain id or chain key | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**StatusResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response of the Status request |  -  |
**400** | The passed parameters are invalid |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **tokenGet**
> Array<Token> tokenGet()

This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiTokenGetRequest = {
  // string | Id or key of the chain that contains the token
  chain: "POL",
  // string | Address or symbol of the token on the requested chain
  token: "DAI",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.tokenGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chain** | [**string**] | Id or key of the chain that contains the token | defaults to undefined
 **token** | [**string**] | Address or symbol of the token on the requested chain | defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**Array<Token>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |
**400** | User passed an invalid chain id or abbrevation |  -  |
**404** | No token found for the given address and chain |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **tokensGet**
> TokensGet200Response tokensGet()

This endpoint can be used to fetch all tokens known to the LI.FI services.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiTokensGetRequest = {
  // string | Restrict the resulting tokens to the given chains (optional)
  chains: "POL,DAI",
  // string | Restrict the resulting tokens to the given chainTypes. (optional)
  chainTypes: "EVM,SVM",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.tokensGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chains** | [**string**] | Restrict the resulting tokens to the given chains | (optional) defaults to undefined
 **chainTypes** | [**string**] | Restrict the resulting tokens to the given chainTypes. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**TokensGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **toolsGet**
> Tools toolsGet()

This endpoint can be used to get information about the bridges and exchanges available trough our service

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .DefaultApi(configuration);

let body:.DefaultApiToolsGetRequest = {
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.toolsGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**Tools**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Object listing all the currently enabled bridges and exchanges. |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


