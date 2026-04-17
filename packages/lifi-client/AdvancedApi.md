# .AdvancedApi

All URIs are relative to *https://li.quest/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**advancedPossibilitiesPost**](AdvancedApi.md#advancedPossibilitiesPost) | **POST** /advanced/possibilities | Get information about available services, chains and tokens
[**advancedRoutesPost**](AdvancedApi.md#advancedRoutesPost) | **POST** /advanced/routes | Get a set of routes for a request that describes a transfer of tokens
[**advancedStepTransactionPost**](AdvancedApi.md#advancedStepTransactionPost) | **POST** /advanced/stepTransaction | Populate a step with transaction data


# **advancedPossibilitiesPost**
> PossibilitiesResponse advancedPossibilitiesPost()

Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .AdvancedApi(configuration);

let body:.AdvancedApiAdvancedPossibilitiesPostRequest = {
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
  // PossiblitiesRequest | Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: `1inch`, `paraswap`, `openocean`, `0x`. Currently available bridges are `hop`, `multichain`, `cbridge`, `celercircle`, `connext`, `amarok`, `celerim`, `hyphen`, `optimism`, `polygon`, `arbitrum`, `avalanche`, `across`, `stargate`, `gnosis` and `omni`. (optional)
  possiblitiesRequest: {
    chains: [
      3.14,
    ],
    bridges: {
      allow: [
        "allow_example",
      ],
      deny: [
        "deny_example",
      ],
      prefer: [
        "prefer_example",
      ],
    },
    exchanges: {
      allow: [
        "allow_example",
      ],
      deny: [
        "deny_example",
      ],
      prefer: [
        "prefer_example",
      ],
    },
    include: [
      "chains",
    ],
  },
};

apiInstance.advancedPossibilitiesPost(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **possiblitiesRequest** | **PossiblitiesRequest**| Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60;, &#x60;0x&#x60;. Currently available bridges are &#x60;hop&#x60;, &#x60;multichain&#x60;, &#x60;cbridge&#x60;, &#x60;celercircle&#x60;, &#x60;connext&#x60;, &#x60;amarok&#x60;, &#x60;celerim&#x60;, &#x60;hyphen&#x60;, &#x60;optimism&#x60;, &#x60;polygon&#x60;, &#x60;arbitrum&#x60;, &#x60;avalanche&#x60;, &#x60;across&#x60;, &#x60;stargate&#x60;, &#x60;gnosis&#x60; and &#x60;omni&#x60;. |
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**PossibilitiesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Object listing current possibilities for any-to-any cross-chain-swaps based on the provided preferences. |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **advancedRoutesPost**
> RoutesResponse advancedRoutesPost(routesRequest)

In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .AdvancedApi(configuration);

let body:.AdvancedApiAdvancedRoutesPostRequest = {
  // RoutesRequest | The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes.
  routesRequest: {
    fromChainId: 3.14,
    fromAmount: "fromAmount_example",
    fromTokenAddress: "fromTokenAddress_example",
    toChainId: 3.14,
    toTokenAddress: "toTokenAddress_example",
    options: {
      integrator: "integrator_example",
      slippage: 3.14,
      bridges: {
        allow: [
          "allow_example",
        ],
        deny: [
          "deny_example",
        ],
        prefer: [
          "prefer_example",
        ],
      },
      exchanges: {
        allow: [
          "allow_example",
        ],
        deny: [
          "deny_example",
        ],
        prefer: [
          "prefer_example",
        ],
      },
      order: "RECOMMENDED",
      allowSwitchChain: true,
      referrer: "referrer_example",
      fee: 3.14,
      maxPriceImpact: 3.14,
    },
    fromAddress: "fromAddress_example",
    toAddress: "toAddress_example",
  },
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.advancedRoutesPost(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **routesRequest** | **RoutesRequest**| The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes. |
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**RoutesResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | The resulting routes that can be used to realize the described transfer of tokens |  -  |
**400** | Invalid Routes Request |  -  |
**404** | Requested &#x60;to&#x60; or &#x60;from&#x60; token was not found |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **advancedStepTransactionPost**
> Step advancedStepTransactionPost(step)

This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .AdvancedApi(configuration);

let body:.AdvancedApiAdvancedStepTransactionPostRequest = {
  // Step | The step object
  step: {
    id: "id_example",
    type: "swap",
    tool: "tool_example",
    action: {
      fromChainId: 3.14,
      fromAmount: "fromAmount_example",
      fromToken: {
        address: "address_example",
        decimals: 3.14,
        symbol: "symbol_example",
        chainId: 3.14,
        coinKey: "coinKey_example",
        name: "name_example",
        logoURI: "logoURI_example",
        priceUSD: "priceUSD_example",
      },
      toChainId: 3.14,
      toToken: {
        address: "address_example",
        decimals: 3.14,
        symbol: "symbol_example",
        chainId: 3.14,
        coinKey: "coinKey_example",
        name: "name_example",
        logoURI: "logoURI_example",
        priceUSD: "priceUSD_example",
      },
      slippage: 3.14,
      fromAddress: "fromAddress_example",
      toAddress: "toAddress_example",
    },
    estimate: {
      fromAmount: "fromAmount_example",
      toAmount: "toAmount_example",
      toAmountMin: "toAmountMin_example",
      approvalAddress: "approvalAddress_example",
      feeCosts: [
        {
          name: "name_example",
          description: "description_example",
          percentage: "percentage_example",
          token: {
            address: "address_example",
            decimals: 3.14,
            symbol: "symbol_example",
            chainId: 3.14,
            coinKey: "coinKey_example",
            name: "name_example",
            logoURI: "logoURI_example",
            priceUSD: "priceUSD_example",
          },
          amount: "amount_example",
          amountUSD: "amountUSD_example",
          included: true,
        },
      ],
      gasCosts: [
        {
          type: "type_example",
          price: "price_example",
          estimate: "estimate_example",
          limit: "limit_example",
          amount: "amount_example",
          amountUSD: "amountUSD_example",
          token: {
            address: "address_example",
            decimals: 3.14,
            symbol: "symbol_example",
            chainId: 3.14,
            coinKey: "coinKey_example",
            name: "name_example",
            logoURI: "logoURI_example",
            priceUSD: "priceUSD_example",
          },
        },
      ],
      data: {
        bid: {
          user: "user_example",
          router: "router_example",
          initiator: "initiator_example",
          sendingChainId: 3.14,
          sendingAssetId: "sendingAssetId_example",
          amount: "amount_example",
          receivingChainId: 3.14,
          receivingAssetId: "receivingAssetId_example",
          amountReceived: "amountReceived_example",
          receivingAddress: "receivingAddress_example",
          transactionId: "transactionId_example",
          expiry: 3.14,
          callDataHash: "callDataHash_example",
          callTo: "callTo_example",
          encryptedCallData: "encryptedCallData_example",
          sendingChainTxManagerAddress: "sendingChainTxManagerAddress_example",
          receivingChainTxManagerAddress: "receivingChainTxManagerAddress_example",
          bidExpiry: 3.14,
        },
        bidSignature: "bidSignature_example",
        gasFeeInReceivingToken: "gasFeeInReceivingToken_example",
        totalFee: "totalFee_example",
        metaTxRelayerFee: "metaTxRelayerFee_example",
        routerFee: "routerFee_example",
      },
    },
    integrator: "integrator_example",
    referrer: "referrer_example",
    execution: null,
    transactionRequest: null,
  },
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.advancedStepTransactionPost(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **step** | **Step**| The step object |
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**Step**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | The step populated with the transaction data |  -  |
**400** | Invalid Step Request |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


