# .GasApi

All URIs are relative to *https://li.quest/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**gasPricesChainIdGet**](GasApi.md#gasPricesChainIdGet) | **GET** /gas/prices/{chainId} | Get gas price for the specified chainId
[**gasPricesGet**](GasApi.md#gasPricesGet) | **GET** /gas/prices | Get gas prices for enabled chains


# **gasPricesChainIdGet**
> GasPrice gasPricesChainIdGet()

This endpoint can be used to get the most recent gas prices for the supplied chainId.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .GasApi(configuration);

let body:.GasApiGasPricesChainIdGetRequest = {
  // string | ChaindId from which gas prices should be shown
  chainId: "137",
  // string | If true it wil get the freshest gas prices available. (optional)
  refresh: "true",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.gasPricesChainIdGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **chainId** | [**string**] | ChaindId from which gas prices should be shown | defaults to undefined
 **refresh** | [**string**] | If true it wil get the freshest gas prices available. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**GasPrice**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Gas Prices for the supplied chainID |  -  |
**400** | Invalid Routes Request |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)

# **gasPricesGet**
> GasPrice gasPricesGet()

This endpoint can be used to get the most recent gas prices for the enabled chains in the server.

### Example


```typescript
import {  } from '';
import * as fs from 'fs';

const configuration = .createConfiguration();
const apiInstance = new .GasApi(configuration);

let body:.GasApiGasPricesGetRequest = {
  // string | If true it wil get the freshest gas prices available. (optional)
  refresh: "true",
  // string | Authentication header, contact support if you want to get registered. (optional)
  xLifiApiKey: "x-lifi-api-key_example",
};

apiInstance.gasPricesGet(body).then((data:any) => {
  console.log('API called successfully. Returned data: ' + data);
}).catch((error:any) => console.error(error));
```


### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refresh** | [**string**] | If true it wil get the freshest gas prices available. | (optional) defaults to undefined
 **xLifiApiKey** | [**string**] | Authentication header, contact support if you want to get registered. | (optional) defaults to undefined


### Return type

**GasPrice**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Gas Prices for the supplied chainID |  -  |

[[Back to top]](#) [[Back to API list]](README.md#documentation-for-api-endpoints) [[Back to Model list]](README.md#documentation-for-models) [[Back to README]](README.md)


