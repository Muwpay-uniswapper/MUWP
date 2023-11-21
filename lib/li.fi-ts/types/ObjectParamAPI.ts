import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration} from '../configuration'

import { Action } from '../models/Action';
import { AllowDenyPrefer } from '../models/AllowDenyPrefer';
import { BasicTransaction } from '../models/BasicTransaction';
import { Bridge } from '../models/Bridge';
import { BridgeDefinition } from '../models/BridgeDefinition';
import { BridgesEnum } from '../models/BridgesEnum';
import { Chain } from '../models/Chain';
import { ChainMetamask } from '../models/ChainMetamask';
import { ChainMetamaskNativeCurrency } from '../models/ChainMetamaskNativeCurrency';
import { ChainsResponse } from '../models/ChainsResponse';
import { Connection } from '../models/Connection';
import { ConnectionsResponse } from '../models/ConnectionsResponse';
import { ContractCall } from '../models/ContractCall';
import { ContractCallRequest } from '../models/ContractCallRequest';
import { ContractCallsRequest } from '../models/ContractCallsRequest';
import { Estimate } from '../models/Estimate';
import { EstimateData } from '../models/EstimateData';
import { Exchange } from '../models/Exchange';
import { ExchangeDefinition } from '../models/ExchangeDefinition';
import { ExchangesEnum } from '../models/ExchangesEnum';
import { FeeBalances } from '../models/FeeBalances';
import { FeeCost } from '../models/FeeCost';
import { GasCost } from '../models/GasCost';
import { GasPrice } from '../models/GasPrice';
import { IntegratorResponse } from '../models/IntegratorResponse';
import { IntegratorWithdrawalResponse } from '../models/IntegratorWithdrawalResponse';
import { IntegratorWithdrawalResponseTransactionRequest } from '../models/IntegratorWithdrawalResponseTransactionRequest';
import { LIFuelStatus } from '../models/LIFuelStatus';
import { LIFuelStatusStateEnum } from '../models/LIFuelStatusStateEnum';
import { PossibilitiesResponse } from '../models/PossibilitiesResponse';
import { PossibilitiesTopicEnum } from '../models/PossibilitiesTopicEnum';
import { PossiblitiesRequest } from '../models/PossiblitiesRequest';
import { QuoteBridgesEnum } from '../models/QuoteBridgesEnum';
import { QuoteExchangesEnum } from '../models/QuoteExchangesEnum';
import { QuoteGet404Response } from '../models/QuoteGet404Response';
import { Route } from '../models/Route';
import { RouteOptions } from '../models/RouteOptions';
import { RoutesRequest } from '../models/RoutesRequest';
import { RoutesResponse } from '../models/RoutesResponse';
import { StatusResponse } from '../models/StatusResponse';
import { Step } from '../models/Step';
import { StepRequest } from '../models/StepRequest';
import { StepRequestAction } from '../models/StepRequestAction';
import { StepRequestActionFromToken } from '../models/StepRequestActionFromToken';
import { StepRequestEstimate } from '../models/StepRequestEstimate';
import { StepRequestEstimateData } from '../models/StepRequestEstimateData';
import { StepRequestEstimateDataBid } from '../models/StepRequestEstimateDataBid';
import { StepRequestEstimateFeeCostsInner } from '../models/StepRequestEstimateFeeCostsInner';
import { StepRequestEstimateGasCostsInner } from '../models/StepRequestEstimateGasCostsInner';
import { StepRequestEstimateGasCostsInnerToken } from '../models/StepRequestEstimateGasCostsInnerToken';
import { StepRequestExecution } from '../models/StepRequestExecution';
import { StepRequestExecutionProcessInner } from '../models/StepRequestExecutionProcessInner';
import { SupportedChains } from '../models/SupportedChains';
import { Token } from '../models/Token';
import { TokenBalances } from '../models/TokenBalances';
import { TokenRequest } from '../models/TokenRequest';
import { TokensGet200Response } from '../models/TokensGet200Response';
import { ToolError } from '../models/ToolError';
import { Tools } from '../models/Tools';
import { TransactionInfo } from '../models/TransactionInfo';
import { TxInfo } from '../models/TxInfo';
import { UnavailableRoutes } from '../models/UnavailableRoutes';
import { UnavailableRoutesFailedInner } from '../models/UnavailableRoutesFailedInner';
import { UnavailableRoutesFilteredOutInner } from '../models/UnavailableRoutesFilteredOutInner';
import { WalletAnalyticsResponse } from '../models/WalletAnalyticsResponse';

import { ObservableAdvancedApi } from "./ObservableAPI";
import { AdvancedApiRequestFactory, AdvancedApiResponseProcessor} from "../apis/AdvancedApi";

export interface AdvancedApiAdvancedPossibilitiesPostRequest {
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof AdvancedApiadvancedPossibilitiesPost
     */
    xLifiApiKey?: string
    /**
     * Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60;, &#x60;0x&#x60;. Currently available bridges are &#x60;hop&#x60;, &#x60;multichain&#x60;, &#x60;cbridge&#x60;, &#x60;celercircle&#x60;, &#x60;connext&#x60;, &#x60;amarok&#x60;, &#x60;celerim&#x60;, &#x60;hyphen&#x60;, &#x60;optimism&#x60;, &#x60;polygon&#x60;, &#x60;arbitrum&#x60;, &#x60;avalanche&#x60;, &#x60;across&#x60;, &#x60;stargate&#x60;, &#x60;gnosis&#x60; and &#x60;omni&#x60;.
     * @type PossiblitiesRequest
     * @memberof AdvancedApiadvancedPossibilitiesPost
     */
    possiblitiesRequest?: PossiblitiesRequest
}

export interface AdvancedApiAdvancedRoutesPostRequest {
    /**
     * The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes.
     * @type RoutesRequest
     * @memberof AdvancedApiadvancedRoutesPost
     */
    routesRequest: RoutesRequest
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof AdvancedApiadvancedRoutesPost
     */
    xLifiApiKey?: string
}

export interface AdvancedApiAdvancedStepTransactionPostRequest {
    /**
     * The step object
     * @type Step
     * @memberof AdvancedApiadvancedStepTransactionPost
     */
    step: Step
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof AdvancedApiadvancedStepTransactionPost
     */
    xLifiApiKey?: string
}

export class ObjectAdvancedApi {
    private api: ObservableAdvancedApi

    public constructor(configuration: Configuration, requestFactory?: AdvancedApiRequestFactory, responseProcessor?: AdvancedApiResponseProcessor) {
        this.api = new ObservableAdvancedApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get information about available services, chains and tokens
     * @param param the request object
     */
    public advancedPossibilitiesPostWithHttpInfo(param: AdvancedApiAdvancedPossibilitiesPostRequest = {}, options?: Configuration): Promise<HttpInfo<PossibilitiesResponse>> {
        return this.api.advancedPossibilitiesPostWithHttpInfo(param.xLifiApiKey, param.possiblitiesRequest,  options).toPromise();
    }

    /**
     * Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get information about available services, chains and tokens
     * @param param the request object
     */
    public advancedPossibilitiesPost(param: AdvancedApiAdvancedPossibilitiesPostRequest = {}, options?: Configuration): Promise<PossibilitiesResponse> {
        return this.api.advancedPossibilitiesPost(param.xLifiApiKey, param.possiblitiesRequest,  options).toPromise();
    }

    /**
     * In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get a set of routes for a request that describes a transfer of tokens
     * @param param the request object
     */
    public advancedRoutesPostWithHttpInfo(param: AdvancedApiAdvancedRoutesPostRequest, options?: Configuration): Promise<HttpInfo<RoutesResponse>> {
        return this.api.advancedRoutesPostWithHttpInfo(param.routesRequest, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get a set of routes for a request that describes a transfer of tokens
     * @param param the request object
     */
    public advancedRoutesPost(param: AdvancedApiAdvancedRoutesPostRequest, options?: Configuration): Promise<RoutesResponse> {
        return this.api.advancedRoutesPost(param.routesRequest, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Populate a step with transaction data
     * @param param the request object
     */
    public advancedStepTransactionPostWithHttpInfo(param: AdvancedApiAdvancedStepTransactionPostRequest, options?: Configuration): Promise<HttpInfo<Step>> {
        return this.api.advancedStepTransactionPostWithHttpInfo(param.step, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Populate a step with transaction data
     * @param param the request object
     */
    public advancedStepTransactionPost(param: AdvancedApiAdvancedStepTransactionPostRequest, options?: Configuration): Promise<Step> {
        return this.api.advancedStepTransactionPost(param.step, param.xLifiApiKey,  options).toPromise();
    }

}

import { ObservableDefaultApi } from "./ObservableAPI";
import { DefaultApiRequestFactory, DefaultApiResponseProcessor} from "../apis/DefaultApi";

export interface DefaultApiAnalyticsTransfersGetRequest {
    /**
     * The integrator string to filter by
     * @type string
     * @memberof DefaultApianalyticsTransfersGet
     */
    integrator: string
    /**
     * The sending OR receiving wallet address 
     * @type string
     * @memberof DefaultApianalyticsTransfersGet
     */
    wallet?: string
    /**
     * The status of the transfers. Possible values are &#x60;ALL&#x60;, &#x60;DONE&#x60;, &#x60;PENDING&#x60;, and &#x60;FAILED&#x60;. The default is &#x60;DONE&#x60;
     * @type string
     * @memberof DefaultApianalyticsTransfersGet
     */
    status?: string
    /**
     * The oldest timestamp that should be taken into consideration. Defaults to 30 days ago
     * @type number
     * @memberof DefaultApianalyticsTransfersGet
     */
    fromTimestamp?: number
    /**
     * The newest timestamp that should be taken into consideration. Defaults to now
     * @type number
     * @memberof DefaultApianalyticsTransfersGet
     */
    toTimestamp?: number
}

export interface DefaultApiAnalyticsWalletsWalletAddressGetRequest {
    /**
     * The address of the wallet
     * @type string
     * @memberof DefaultApianalyticsWalletsWalletAddressGet
     */
    walletAddress: string
    /**
     * Filter the transactions by integrator
     * @type string
     * @memberof DefaultApianalyticsWalletsWalletAddressGet
     */
    integrator: string
    /**
     * A unix timestamp in seconds. No transaction older than this timestamp will be returned.
     * @type number
     * @memberof DefaultApianalyticsWalletsWalletAddressGet
     */
    fromTimestamp?: number
    /**
     * A unix timestamp in seconds. No transaction newer than this timestamp will be returned.
     * @type number
     * @memberof DefaultApianalyticsWalletsWalletAddressGet
     */
    toTimestamp?: number
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApianalyticsWalletsWalletAddressGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiCalldataParseGetRequest {
    /**
     * The call data to parse
     * @type string
     * @memberof DefaultApicalldataParseGet
     */
    callData: string
    /**
     * The chainId that the transaction is built for (or has been sent on)
     * @type string
     * @memberof DefaultApicalldataParseGet
     */
    chainId?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApicalldataParseGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiChainsGetRequest {
    /**
     * Restrict the resulting tokens to the given chainTypes.
     * @type string
     * @memberof DefaultApichainsGet
     */
    chainTypes?: string
    /**
     * The apiKey allows you to authenticate on the API.
     * @type string
     * @memberof DefaultApichainsGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiConnectionsGetRequest {
    /**
     * The chain that should be the start of the possible connections.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    fromChain?: string
    /**
     * The chain that should be the end of the possible connections.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    toChain?: string
    /**
     * Only return connections starting with this token.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    fromToken?: string
    /**
     * Only return connections ending with this token.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    toToken?: string
    /**
     * Restrict the resulting tokens to the given chainTypes.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    chainTypes?: string
    /**
     * List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All bridges can be loaded from the /tools endpoint.
     * @type Array&lt;string&gt;
     * @memberof DefaultApiconnectionsGet
     */
    allowBridges?: Array<string>
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApiconnectionsGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiGasRefetchGetRequest {
    /**
     * The transaction hash that started the gas refilling process
     * @type string
     * @memberof DefaultApigasRefetchGet
     */
    txHash: string
    /**
     * The chain where the deposit was originally made
     * @type string
     * @memberof DefaultApigasRefetchGet
     */
    chainId: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApigasRefetchGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiGasStatusGetRequest {
    /**
     * The transaction hash that started the gas refilling process
     * @type string
     * @memberof DefaultApigasStatusGet
     */
    txHash: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApigasStatusGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiGasSuggestionChainGetRequest {
    /**
     * Chain from which gas prices should be shown (can be a chain id or a chain key)
     * @type string
     * @memberof DefaultApigasSuggestionChainGet
     */
    chain: string
    /**
     * If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @type string
     * @memberof DefaultApigasSuggestionChainGet
     */
    fromChain?: string
    /**
     * If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @type string
     * @memberof DefaultApigasSuggestionChainGet
     */
    fromToken?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApigasSuggestionChainGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiIntegratorsIntegratorIdGetRequest {
    /**
     * Address or the name of the integrator that requests fee balances
     * @type string
     * @memberof DefaultApiintegratorsIntegratorIdGet
     */
    integratorId: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApiintegratorsIntegratorIdGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiIntegratorsIntegratorIdWithdrawChainIdGetRequest {
    /**
     * Address or the name of the integrator that requests fee withdrawal
     * @type string
     * @memberof DefaultApiintegratorsIntegratorIdWithdrawChainIdGet
     */
    integratorId: string
    /**
     * Specify chainId from which funds should be withdrawn
     * @type string
     * @memberof DefaultApiintegratorsIntegratorIdWithdrawChainIdGet
     */
    chainId: string
    /**
     * Specify tokens from which funds should be withdraw
     * @type Array&lt;string&gt;
     * @memberof DefaultApiintegratorsIntegratorIdWithdrawChainIdGet
     */
    tokenAddresses?: Array<string>
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApiintegratorsIntegratorIdWithdrawChainIdGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiQuoteContractCallPostRequest {
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApiquoteContractCallPost
     */
    xLifiApiKey?: string
    /**
     * Object describing what tokens to transfer and how to interact with the destination contract.
     * @type ContractCallRequest
     * @memberof DefaultApiquoteContractCallPost
     */
    contractCallRequest?: ContractCallRequest
}

export interface DefaultApiQuoteContractCallsPostRequest {
    /**
     * The apiKey allows you to authenticate on the API.
     * @type string
     * @memberof DefaultApiquoteContractCallsPost
     */
    xLifiApiKey?: string
    /**
     * Object describing what tokens to transfer and how to interact with the destination contracts.
     * @type ContractCallsRequest
     * @memberof DefaultApiquoteContractCallsPost
     */
    contractCallsRequest?: ContractCallsRequest
}

export interface DefaultApiQuoteGetRequest {
    /**
     * The sending chain. Can be the chain id or chain key
     * @type string
     * @memberof DefaultApiquoteGet
     */
    fromChain: string
    /**
     * The receiving chain. Can be the chain id or chain key
     * @type string
     * @memberof DefaultApiquoteGet
     */
    toChain: string
    /**
     * The token that should be transferred. Can be the address or the symbol
     * @type string
     * @memberof DefaultApiquoteGet
     */
    fromToken: string
    /**
     * The token that should be transferred to. Can be the address or the symbol
     * @type string
     * @memberof DefaultApiquoteGet
     */
    toToken: string
    /**
     * The sending wallet address
     * @type string
     * @memberof DefaultApiquoteGet
     */
    fromAddress: string
    /**
     * The amount that should be sent including all decimals (e.g. 1000000 for 1 USDC (6 decimals))
     * @type string
     * @memberof DefaultApiquoteGet
     */
    fromAmount: string
    /**
     * The receiving wallet address. If none is provided, the fromAddress will be used
     * @type string
     * @memberof DefaultApiquoteGet
     */
    toAddress?: string
    /**
     * Which kind of route should be preferred **RECOMMENDED**: This sorting criterion aims to find a balance between cost and complexity, prioritizing affordable and less complex routes. It first sorts routes based on their cost and then focuses on the top 5% of the routes. These top routes are ranked by considering both their cheapness and ease of use. **FASTEST**: This sorting criterion prioritizes routes with the shortest estimated execution time. Users who value speed and want their transactions to be completed as quickly as possible should choose the fastest routes. **CHEAPEST**: This criterion focuses on minimizing the cost of the transaction, whether in token amount or USD amount (USD amount minus gas cost). Users looking for the most economical option should choose the cheapest routes. **SAFEST**: Sorting by this criterion emphasizes the safety and reliability of the routes. Routes are ranked based on the safety level of the tools (bridges) used in their steps. Users who prioritize security and want to minimize risks associated with their transactions should choose the safest routes. If two routes have the same safety level, they are further ranked based on their speed.
     * @type &#39;RECOMMENDED&#39; | &#39;FASTEST&#39; | &#39;CHEAPEST&#39; | &#39;SAFEST&#39;
     * @memberof DefaultApiquoteGet
     */
    order?: 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST'
    /**
     * The maximum allowed slippage for the transaction as a decimal value. 0.005 represents 0.5%.
     * @type number
     * @memberof DefaultApiquoteGet
     */
    slippage?: number
    /**
     * A string containing tracking information about the integrator of the API
     * @type string
     * @memberof DefaultApiquoteGet
     */
    integrator?: string
    /**
     * The percent of the integrator\&#39;s fee that is taken from every transaction. 0.02 represents 2%. The maximum fee amount is 10%.
     * @type number
     * @memberof DefaultApiquoteGet
     */
    fee?: number
    /**
     * A string containing tracking information about the referrer of the integrator
     * @type string
     * @memberof DefaultApiquoteGet
     */
    referrer?: string
    /**
     * List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteBridgesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    allowBridges?: Array<QuoteBridgesEnum>
    /**
     * List of exchanges that are allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteExchangesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    allowExchanges?: Array<QuoteExchangesEnum>
    /**
     * List of bridges that are not allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteBridgesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    denyBridges?: Array<QuoteBridgesEnum>
    /**
     * List of exchanges that are not allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteExchangesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    denyExchanges?: Array<QuoteExchangesEnum>
    /**
     * List of bridges that should be preferred for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteBridgesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    preferBridges?: Array<QuoteBridgesEnum>
    /**
     * List of exchanges that should be preferred for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @type Array&lt;QuoteExchangesEnum&gt;
     * @memberof DefaultApiquoteGet
     */
    preferExchanges?: Array<QuoteExchangesEnum>
    /**
     * Whether swaps or other contract calls should be allowed as part of the destination transaction of a bridge transfer. Separate swap transactions on the destination chain are not affected by this flag. By default, parameter is &#x60;true&#x60;.
     * @type boolean
     * @memberof DefaultApiquoteGet
     */
    allowDestinationCall?: boolean
    /**
     * The price impact threshold above which routes are hidden. As an example, one should specify 0.15 (15%) to hide routes with more than 15% price impact. The default is 10%.
     * @type number
     * @memberof DefaultApiquoteGet
     */
    maxPriceImpact?: number
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApiquoteGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiStatusGetRequest {
    /**
     * The transaction hash on the sending chain
     * @type string
     * @memberof DefaultApistatusGet
     */
    txHash: string
    /**
     * The bridging tool used for the transfer
     * @type BridgesEnum
     * @memberof DefaultApistatusGet
     */
    bridge?: BridgesEnum
    /**
     * The sending chain. Can be the chain id or chain key
     * @type string
     * @memberof DefaultApistatusGet
     */
    fromChain?: string
    /**
     * The receiving chain. Can be the chain id or chain key
     * @type string
     * @memberof DefaultApistatusGet
     */
    toChain?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApistatusGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiTokenGetRequest {
    /**
     * Id or key of the chain that contains the token
     * @type string
     * @memberof DefaultApitokenGet
     */
    chain: string
    /**
     * Address or symbol of the token on the requested chain
     * @type string
     * @memberof DefaultApitokenGet
     */
    token: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApitokenGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiTokensGetRequest {
    /**
     * Restrict the resulting tokens to the given chains
     * @type string
     * @memberof DefaultApitokensGet
     */
    chains?: string
    /**
     * Restrict the resulting tokens to the given chainTypes.
     * @type string
     * @memberof DefaultApitokensGet
     */
    chainTypes?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApitokensGet
     */
    xLifiApiKey?: string
}

export interface DefaultApiToolsGetRequest {
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof DefaultApitoolsGet
     */
    xLifiApiKey?: string
}

export class ObjectDefaultApi {
    private api: ObservableDefaultApi

    public constructor(configuration: Configuration, requestFactory?: DefaultApiRequestFactory, responseProcessor?: DefaultApiResponseProcessor) {
        this.api = new ObservableDefaultApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.
     * Get a list of filtered transfers
     * @param param the request object
     */
    public analyticsTransfersGetWithHttpInfo(param: DefaultApiAnalyticsTransfersGetRequest, options?: Configuration): Promise<HttpInfo<any>> {
        return this.api.analyticsTransfersGetWithHttpInfo(param.integrator, param.wallet, param.status, param.fromTimestamp, param.toTimestamp,  options).toPromise();
    }

    /**
     * This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.
     * Get a list of filtered transfers
     * @param param the request object
     */
    public analyticsTransfersGet(param: DefaultApiAnalyticsTransfersGetRequest, options?: Configuration): Promise<any> {
        return this.api.analyticsTransfersGet(param.integrator, param.wallet, param.status, param.fromTimestamp, param.toTimestamp,  options).toPromise();
    }

    /**
     * This endpoint can be used to get all transactions for a wallet.
     * Get all transactions for a wallet
     * @param param the request object
     */
    public analyticsWalletsWalletAddressGetWithHttpInfo(param: DefaultApiAnalyticsWalletsWalletAddressGetRequest, options?: Configuration): Promise<HttpInfo<WalletAnalyticsResponse>> {
        return this.api.analyticsWalletsWalletAddressGetWithHttpInfo(param.walletAddress, param.integrator, param.fromTimestamp, param.toTimestamp, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get all transactions for a wallet.
     * Get all transactions for a wallet
     * @param param the request object
     */
    public analyticsWalletsWalletAddressGet(param: DefaultApiAnalyticsWalletsWalletAddressGetRequest, options?: Configuration): Promise<WalletAnalyticsResponse> {
        return this.api.analyticsWalletsWalletAddressGet(param.walletAddress, param.integrator, param.fromTimestamp, param.toTimestamp, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.
     * Parse transaction call data (BETA)
     * @param param the request object
     */
    public calldataParseGetWithHttpInfo(param: DefaultApiCalldataParseGetRequest, options?: Configuration): Promise<HttpInfo<void>> {
        return this.api.calldataParseGetWithHttpInfo(param.callData, param.chainId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.
     * Parse transaction call data (BETA)
     * @param param the request object
     */
    public calldataParseGet(param: DefaultApiCalldataParseGetRequest, options?: Configuration): Promise<void> {
        return this.api.calldataParseGet(param.callData, param.chainId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).
     * Get information about all currently supported chains
     * @param param the request object
     */
    public chainsGetWithHttpInfo(param: DefaultApiChainsGetRequest = {}, options?: Configuration): Promise<HttpInfo<ChainsResponse>> {
        return this.api.chainsGetWithHttpInfo(param.chainTypes, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).
     * Get information about all currently supported chains
     * @param param the request object
     */
    public chainsGet(param: DefaultApiChainsGetRequest = {}, options?: Configuration): Promise<ChainsResponse> {
        return this.api.chainsGet(param.chainTypes, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint gives information about all possible tranfers between chains. Since the result can be very large it is required to filter by at least a chain, a token, a bridge, or an exchange. Information about which chains and tokens are supported can be taken from the response of the /chains endpoint. Information about which bridges and exchanges are supported can be taken from the response of the /tools endpoint.
     * Returns all possible connections based on a from- or toChain.
     * @param param the request object
     */
    public connectionsGetWithHttpInfo(param: DefaultApiConnectionsGetRequest = {}, options?: Configuration): Promise<HttpInfo<ConnectionsResponse>> {
        return this.api.connectionsGetWithHttpInfo(param.fromChain, param.toChain, param.fromToken, param.toToken, param.chainTypes, param.allowBridges, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint gives information about all possible tranfers between chains. Since the result can be very large it is required to filter by at least a chain, a token, a bridge, or an exchange. Information about which chains and tokens are supported can be taken from the response of the /chains endpoint. Information about which bridges and exchanges are supported can be taken from the response of the /tools endpoint.
     * Returns all possible connections based on a from- or toChain.
     * @param param the request object
     */
    public connectionsGet(param: DefaultApiConnectionsGetRequest = {}, options?: Configuration): Promise<ConnectionsResponse> {
        return this.api.connectionsGet(param.fromChain, param.toChain, param.fromToken, param.toToken, param.chainTypes, param.allowBridges, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
     * @param param the request object
     */
    public gasRefetchGetWithHttpInfo(param: DefaultApiGasRefetchGetRequest, options?: Configuration): Promise<HttpInfo<LIFuelStatus>> {
        return this.api.gasRefetchGetWithHttpInfo(param.txHash, param.chainId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
     * @param param the request object
     */
    public gasRefetchGet(param: DefaultApiGasRefetchGetRequest, options?: Configuration): Promise<LIFuelStatus> {
        return this.api.gasRefetchGet(param.txHash, param.chainId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Get status information about a lifuel transaction
     * @param param the request object
     */
    public gasStatusGetWithHttpInfo(param: DefaultApiGasStatusGetRequest, options?: Configuration): Promise<HttpInfo<LIFuelStatus>> {
        return this.api.gasStatusGetWithHttpInfo(param.txHash, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Get status information about a lifuel transaction
     * @param param the request object
     */
    public gasStatusGet(param: DefaultApiGasStatusGetRequest, options?: Configuration): Promise<LIFuelStatus> {
        return this.api.gasStatusGet(param.txHash, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.
     * Get a gas suggestion for the specified chain
     * @param param the request object
     */
    public gasSuggestionChainGetWithHttpInfo(param: DefaultApiGasSuggestionChainGetRequest, options?: Configuration): Promise<HttpInfo<void>> {
        return this.api.gasSuggestionChainGetWithHttpInfo(param.chain, param.fromChain, param.fromToken, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.
     * Get a gas suggestion for the specified chain
     * @param param the request object
     */
    public gasSuggestionChainGet(param: DefaultApiGasSuggestionChainGetRequest, options?: Configuration): Promise<void> {
        return this.api.gasSuggestionChainGet(param.chain, param.fromChain, param.fromToken, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.
     * Get integrator\'s collected fees data for all supported chains
     * @param param the request object
     */
    public integratorsIntegratorIdGetWithHttpInfo(param: DefaultApiIntegratorsIntegratorIdGetRequest, options?: Configuration): Promise<HttpInfo<IntegratorResponse>> {
        return this.api.integratorsIntegratorIdGetWithHttpInfo(param.integratorId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.
     * Get integrator\'s collected fees data for all supported chains
     * @param param the request object
     */
    public integratorsIntegratorIdGet(param: DefaultApiIntegratorsIntegratorIdGetRequest, options?: Configuration): Promise<IntegratorResponse> {
        return this.api.integratorsIntegratorIdGet(param.integratorId, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.
     * Get transaction request for withdrawing collected integrator\'s fees by chain
     * @param param the request object
     */
    public integratorsIntegratorIdWithdrawChainIdGetWithHttpInfo(param: DefaultApiIntegratorsIntegratorIdWithdrawChainIdGetRequest, options?: Configuration): Promise<HttpInfo<IntegratorWithdrawalResponse>> {
        return this.api.integratorsIntegratorIdWithdrawChainIdGetWithHttpInfo(param.integratorId, param.chainId, param.tokenAddresses, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.
     * Get transaction request for withdrawing collected integrator\'s fees by chain
     * @param param the request object
     */
    public integratorsIntegratorIdWithdrawChainIdGet(param: DefaultApiIntegratorsIntegratorIdWithdrawChainIdGetRequest, options?: Configuration): Promise<IntegratorWithdrawalResponse> {
        return this.api.integratorsIntegratorIdWithdrawChainIdGet(param.integratorId, param.chainId, param.tokenAddresses, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint has been deprecated in favour of /quote/contractCalls.
     * Perform a contract call across blockchains (BETA)
     * @param param the request object
     */
    public quoteContractCallPostWithHttpInfo(param: DefaultApiQuoteContractCallPostRequest = {}, options?: Configuration): Promise<HttpInfo<Tools>> {
        return this.api.quoteContractCallPostWithHttpInfo(param.xLifiApiKey, param.contractCallRequest,  options).toPromise();
    }

    /**
     * This endpoint has been deprecated in favour of /quote/contractCalls.
     * Perform a contract call across blockchains (BETA)
     * @param param the request object
     */
    public quoteContractCallPost(param: DefaultApiQuoteContractCallPostRequest = {}, options?: Configuration): Promise<Tools> {
        return this.api.quoteContractCallPost(param.xLifiApiKey, param.contractCallRequest,  options).toPromise();
    }

    /**
     * This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.
     * Perform multiple contract calls across blockchains (BETA)
     * @param param the request object
     */
    public quoteContractCallsPostWithHttpInfo(param: DefaultApiQuoteContractCallsPostRequest = {}, options?: Configuration): Promise<HttpInfo<Tools>> {
        return this.api.quoteContractCallsPostWithHttpInfo(param.xLifiApiKey, param.contractCallsRequest,  options).toPromise();
    }

    /**
     * This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.
     * Perform multiple contract calls across blockchains (BETA)
     * @param param the request object
     */
    public quoteContractCallsPost(param: DefaultApiQuoteContractCallsPostRequest = {}, options?: Configuration): Promise<Tools> {
        return this.api.quoteContractCallsPost(param.xLifiApiKey, param.contractCallsRequest,  options).toPromise();
    }

    /**
     * This endpoint can be used to request a quote for a transfer of one token to another, cross chain or not. The endpoint returns a `Step` object which contains information about the estimated result as well as a `transactionRequest` which can directly be sent to your wallet. The estimated result can be found inside the `estimate`, containing the estimated `toAmount` of the requested `Token` and the `toAmountMin`, which is the guaranteed minimum value that the transfer will yield including slippage. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-a-quote).
     * Get a quote for a token transfer
     * @param param the request object
     */
    public quoteGetWithHttpInfo(param: DefaultApiQuoteGetRequest, options?: Configuration): Promise<HttpInfo<Step>> {
        return this.api.quoteGetWithHttpInfo(param.fromChain, param.toChain, param.fromToken, param.toToken, param.fromAddress, param.fromAmount, param.toAddress, param.order, param.slippage, param.integrator, param.fee, param.referrer, param.allowBridges, param.allowExchanges, param.denyBridges, param.denyExchanges, param.preferBridges, param.preferExchanges, param.allowDestinationCall, param.maxPriceImpact, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to request a quote for a transfer of one token to another, cross chain or not. The endpoint returns a `Step` object which contains information about the estimated result as well as a `transactionRequest` which can directly be sent to your wallet. The estimated result can be found inside the `estimate`, containing the estimated `toAmount` of the requested `Token` and the `toAmountMin`, which is the guaranteed minimum value that the transfer will yield including slippage. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-a-quote).
     * Get a quote for a token transfer
     * @param param the request object
     */
    public quoteGet(param: DefaultApiQuoteGetRequest, options?: Configuration): Promise<Step> {
        return this.api.quoteGet(param.fromChain, param.toChain, param.fromToken, param.toToken, param.fromAddress, param.fromAmount, param.toAddress, param.order, param.slippage, param.integrator, param.fee, param.referrer, param.allowBridges, param.allowExchanges, param.denyBridges, param.denyExchanges, param.preferBridges, param.preferExchanges, param.allowDestinationCall, param.maxPriceImpact, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Cross chain transfers might take a while to complete. Waiting on the transaction on the sending chain doesn\'t help here. For this reason we build a simple endpoint that let\'s you check the status of your transfer. Important: The endpoint returns a `200` successful response even if the transaction can not be found. This behavior accounts for the case that the transaction hash is valid but the transaction has not been mined yet. While non of the parameters `fromChain`, `toChain` and `bridge` are required, passing the `fromChain` parameter will speed up the request and is therefore encouraged. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/checking-the-status-of-a-transaction).
     * Check the status of a cross chain transfer
     * @param param the request object
     */
    public statusGetWithHttpInfo(param: DefaultApiStatusGetRequest, options?: Configuration): Promise<HttpInfo<StatusResponse>> {
        return this.api.statusGetWithHttpInfo(param.txHash, param.bridge, param.fromChain, param.toChain, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * Cross chain transfers might take a while to complete. Waiting on the transaction on the sending chain doesn\'t help here. For this reason we build a simple endpoint that let\'s you check the status of your transfer. Important: The endpoint returns a `200` successful response even if the transaction can not be found. This behavior accounts for the case that the transaction hash is valid but the transaction has not been mined yet. While non of the parameters `fromChain`, `toChain` and `bridge` are required, passing the `fromChain` parameter will speed up the request and is therefore encouraged. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/checking-the-status-of-a-transaction).
     * Check the status of a cross chain transfer
     * @param param the request object
     */
    public statusGet(param: DefaultApiStatusGetRequest, options?: Configuration): Promise<StatusResponse> {
        return this.api.statusGet(param.txHash, param.bridge, param.fromChain, param.toChain, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).
     * Fetch information about a Token
     * @param param the request object
     */
    public tokenGetWithHttpInfo(param: DefaultApiTokenGetRequest, options?: Configuration): Promise<HttpInfo<Array<Token>>> {
        return this.api.tokenGetWithHttpInfo(param.chain, param.token, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).
     * Fetch information about a Token
     * @param param the request object
     */
    public tokenGet(param: DefaultApiTokenGetRequest, options?: Configuration): Promise<Array<Token>> {
        return this.api.tokenGet(param.chain, param.token, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to fetch all tokens known to the LI.FI services.
     * Fetch all known tokens
     * @param param the request object
     */
    public tokensGetWithHttpInfo(param: DefaultApiTokensGetRequest = {}, options?: Configuration): Promise<HttpInfo<TokensGet200Response>> {
        return this.api.tokensGetWithHttpInfo(param.chains, param.chainTypes, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to fetch all tokens known to the LI.FI services.
     * Fetch all known tokens
     * @param param the request object
     */
    public tokensGet(param: DefaultApiTokensGetRequest = {}, options?: Configuration): Promise<TokensGet200Response> {
        return this.api.tokensGet(param.chains, param.chainTypes, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get information about the bridges and exchanges available trough our service
     * Get available bridges and exchanges
     * @param param the request object
     */
    public toolsGetWithHttpInfo(param: DefaultApiToolsGetRequest = {}, options?: Configuration): Promise<HttpInfo<Tools>> {
        return this.api.toolsGetWithHttpInfo(param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get information about the bridges and exchanges available trough our service
     * Get available bridges and exchanges
     * @param param the request object
     */
    public toolsGet(param: DefaultApiToolsGetRequest = {}, options?: Configuration): Promise<Tools> {
        return this.api.toolsGet(param.xLifiApiKey,  options).toPromise();
    }

}

import { ObservableGasApi } from "./ObservableAPI";
import { GasApiRequestFactory, GasApiResponseProcessor} from "../apis/GasApi";

export interface GasApiGasPricesChainIdGetRequest {
    /**
     * ChaindId from which gas prices should be shown
     * @type string
     * @memberof GasApigasPricesChainIdGet
     */
    chainId: string
    /**
     * If true it wil get the freshest gas prices available.
     * @type string
     * @memberof GasApigasPricesChainIdGet
     */
    refresh?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof GasApigasPricesChainIdGet
     */
    xLifiApiKey?: string
}

export interface GasApiGasPricesGetRequest {
    /**
     * If true it wil get the freshest gas prices available.
     * @type string
     * @memberof GasApigasPricesGet
     */
    refresh?: string
    /**
     * Authentication header, contact support if you want to get registered.
     * @type string
     * @memberof GasApigasPricesGet
     */
    xLifiApiKey?: string
}

export class ObjectGasApi {
    private api: ObservableGasApi

    public constructor(configuration: Configuration, requestFactory?: GasApiRequestFactory, responseProcessor?: GasApiResponseProcessor) {
        this.api = new ObservableGasApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the supplied chainId.
     * Get gas price for the specified chainId
     * @param param the request object
     */
    public gasPricesChainIdGetWithHttpInfo(param: GasApiGasPricesChainIdGetRequest, options?: Configuration): Promise<HttpInfo<GasPrice>> {
        return this.api.gasPricesChainIdGetWithHttpInfo(param.chainId, param.refresh, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the supplied chainId.
     * Get gas price for the specified chainId
     * @param param the request object
     */
    public gasPricesChainIdGet(param: GasApiGasPricesChainIdGetRequest, options?: Configuration): Promise<GasPrice> {
        return this.api.gasPricesChainIdGet(param.chainId, param.refresh, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the enabled chains in the server.
     * Get gas prices for enabled chains
     * @param param the request object
     */
    public gasPricesGetWithHttpInfo(param: GasApiGasPricesGetRequest = {}, options?: Configuration): Promise<HttpInfo<GasPrice>> {
        return this.api.gasPricesGetWithHttpInfo(param.refresh, param.xLifiApiKey,  options).toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the enabled chains in the server.
     * Get gas prices for enabled chains
     * @param param the request object
     */
    public gasPricesGet(param: GasApiGasPricesGetRequest = {}, options?: Configuration): Promise<GasPrice> {
        return this.api.gasPricesGet(param.refresh, param.xLifiApiKey,  options).toPromise();
    }

}
