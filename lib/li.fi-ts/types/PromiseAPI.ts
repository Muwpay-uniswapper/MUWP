import { ResponseContext, RequestContext, HttpFile, HttpInfo } from '../http/http';
import { Configuration } from '../configuration'

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
import { ObservableAdvancedApi } from './ObservableAPI';

import { AdvancedApiRequestFactory, AdvancedApiResponseProcessor } from "../apis/AdvancedApi";
export class PromiseAdvancedApi {
    private api: ObservableAdvancedApi

    public constructor(
        configuration: Configuration,
        requestFactory?: AdvancedApiRequestFactory,
        responseProcessor?: AdvancedApiResponseProcessor
    ) {
        this.api = new ObservableAdvancedApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get information about available services, chains and tokens
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param possiblitiesRequest Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60;, &#x60;0x&#x60;. Currently available bridges are &#x60;hop&#x60;, &#x60;multichain&#x60;, &#x60;cbridge&#x60;, &#x60;celercircle&#x60;, &#x60;connext&#x60;, &#x60;amarok&#x60;, &#x60;celerim&#x60;, &#x60;hyphen&#x60;, &#x60;optimism&#x60;, &#x60;polygon&#x60;, &#x60;arbitrum&#x60;, &#x60;avalanche&#x60;, &#x60;across&#x60;, &#x60;stargate&#x60;, &#x60;gnosis&#x60; and &#x60;omni&#x60;.
     */
    public advancedPossibilitiesPostWithHttpInfo(xLifiApiKey?: string, possiblitiesRequest?: PossiblitiesRequest, _options?: Configuration): Promise<HttpInfo<PossibilitiesResponse>> {
        const result = this.api.advancedPossibilitiesPostWithHttpInfo(xLifiApiKey, possiblitiesRequest, _options);
        return result.toPromise();
    }

    /**
     * Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get information about available services, chains and tokens
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param possiblitiesRequest Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60;, &#x60;0x&#x60;. Currently available bridges are &#x60;hop&#x60;, &#x60;multichain&#x60;, &#x60;cbridge&#x60;, &#x60;celercircle&#x60;, &#x60;connext&#x60;, &#x60;amarok&#x60;, &#x60;celerim&#x60;, &#x60;hyphen&#x60;, &#x60;optimism&#x60;, &#x60;polygon&#x60;, &#x60;arbitrum&#x60;, &#x60;avalanche&#x60;, &#x60;across&#x60;, &#x60;stargate&#x60;, &#x60;gnosis&#x60; and &#x60;omni&#x60;.
     */
    public advancedPossibilitiesPost(xLifiApiKey?: string, possiblitiesRequest?: PossiblitiesRequest, _options?: Configuration): Promise<PossibilitiesResponse> {
        const result = this.api.advancedPossibilitiesPost(xLifiApiKey, possiblitiesRequest, _options);
        return result.toPromise();
    }

    /**
     * In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get a set of routes for a request that describes a transfer of tokens
     * @param routesRequest The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public advancedRoutesPostWithHttpInfo(routesRequest: RoutesRequest, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<RoutesResponse>> {
        const result = this.api.advancedRoutesPostWithHttpInfo(routesRequest, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get a set of routes for a request that describes a transfer of tokens
     * @param routesRequest The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public advancedRoutesPost(routesRequest: RoutesRequest, xLifiApiKey?: string, _options?: Configuration): Promise<RoutesResponse> {
        const result = this.api.advancedRoutesPost(routesRequest, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Populate a step with transaction data
     * @param step The step object
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public advancedStepTransactionPostWithHttpInfo(step: Step, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<Step>> {
        const result = this.api.advancedStepTransactionPostWithHttpInfo(step, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Populate a step with transaction data
     * @param step The step object
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public advancedStepTransactionPost(step: Step, xLifiApiKey?: string, _options?: Configuration): Promise<Step> {
        const result = this.api.advancedStepTransactionPost(step, xLifiApiKey, _options);
        return result.toPromise();
    }


}



import { ObservableDefaultApi } from './ObservableAPI';

import { DefaultApiRequestFactory, DefaultApiResponseProcessor } from "../apis/DefaultApi";
export class PromiseDefaultApi {
    private api: ObservableDefaultApi

    public constructor(
        configuration: Configuration,
        requestFactory?: DefaultApiRequestFactory,
        responseProcessor?: DefaultApiResponseProcessor
    ) {
        this.api = new ObservableDefaultApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.
     * Get a list of filtered transfers
     * @param integrator The integrator string to filter by
     * @param wallet The sending OR receiving wallet address 
     * @param status The status of the transfers. Possible values are &#x60;ALL&#x60;, &#x60;DONE&#x60;, &#x60;PENDING&#x60;, and &#x60;FAILED&#x60;. The default is &#x60;DONE&#x60;
     * @param fromTimestamp The oldest timestamp that should be taken into consideration. Defaults to 30 days ago
     * @param toTimestamp The newest timestamp that should be taken into consideration. Defaults to now
     */
    public analyticsTransfersGetWithHttpInfo(integrator: string, wallet?: string, status?: string, fromTimestamp?: number, toTimestamp?: number, _options?: Configuration): Promise<HttpInfo<any>> {
        const result = this.api.analyticsTransfersGetWithHttpInfo(integrator, wallet, status, fromTimestamp, toTimestamp, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.
     * Get a list of filtered transfers
     * @param integrator The integrator string to filter by
     * @param wallet The sending OR receiving wallet address 
     * @param status The status of the transfers. Possible values are &#x60;ALL&#x60;, &#x60;DONE&#x60;, &#x60;PENDING&#x60;, and &#x60;FAILED&#x60;. The default is &#x60;DONE&#x60;
     * @param fromTimestamp The oldest timestamp that should be taken into consideration. Defaults to 30 days ago
     * @param toTimestamp The newest timestamp that should be taken into consideration. Defaults to now
     */
    public analyticsTransfersGet(integrator: string, wallet?: string, status?: string, fromTimestamp?: number, toTimestamp?: number, _options?: Configuration): Promise<any> {
        const result = this.api.analyticsTransfersGet(integrator, wallet, status, fromTimestamp, toTimestamp, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get all transactions for a wallet.
     * Get all transactions for a wallet
     * @param walletAddress The address of the wallet
     * @param integrator Filter the transactions by integrator
     * @param fromTimestamp A unix timestamp in seconds. No transaction older than this timestamp will be returned.
     * @param toTimestamp A unix timestamp in seconds. No transaction newer than this timestamp will be returned.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public analyticsWalletsWalletAddressGetWithHttpInfo(walletAddress: string, integrator: string, fromTimestamp?: number, toTimestamp?: number, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<WalletAnalyticsResponse>> {
        const result = this.api.analyticsWalletsWalletAddressGetWithHttpInfo(walletAddress, integrator, fromTimestamp, toTimestamp, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get all transactions for a wallet.
     * Get all transactions for a wallet
     * @param walletAddress The address of the wallet
     * @param integrator Filter the transactions by integrator
     * @param fromTimestamp A unix timestamp in seconds. No transaction older than this timestamp will be returned.
     * @param toTimestamp A unix timestamp in seconds. No transaction newer than this timestamp will be returned.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public analyticsWalletsWalletAddressGet(walletAddress: string, integrator: string, fromTimestamp?: number, toTimestamp?: number, xLifiApiKey?: string, _options?: Configuration): Promise<WalletAnalyticsResponse> {
        const result = this.api.analyticsWalletsWalletAddressGet(walletAddress, integrator, fromTimestamp, toTimestamp, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.
     * Parse transaction call data (BETA)
     * @param callData The call data to parse
     * @param chainId The chainId that the transaction is built for (or has been sent on)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public calldataParseGetWithHttpInfo(callData: string, chainId?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<void>> {
        const result = this.api.calldataParseGetWithHttpInfo(callData, chainId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.
     * Parse transaction call data (BETA)
     * @param callData The call data to parse
     * @param chainId The chainId that the transaction is built for (or has been sent on)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public calldataParseGet(callData: string, chainId?: string, xLifiApiKey?: string, _options?: Configuration): Promise<void> {
        const result = this.api.calldataParseGet(callData, chainId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).
     * Get information about all currently supported chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     */
    public chainsGetWithHttpInfo(chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<ChainsResponse>> {
        const result = this.api.chainsGetWithHttpInfo(chainTypes, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).
     * Get information about all currently supported chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     */
    public chainsGet(chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<ChainsResponse> {
        const result = this.api.chainsGet(chainTypes, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint gives information about all possible tranfers between chains. Since the result can be very large it is required to filter by at least a chain, a token, a bridge, or an exchange. Information about which chains and tokens are supported can be taken from the response of the /chains endpoint. Information about which bridges and exchanges are supported can be taken from the response of the /tools endpoint.
     * Returns all possible connections based on a from- or toChain.
     * @param fromChain The chain that should be the start of the possible connections.
     * @param toChain The chain that should be the end of the possible connections.
     * @param fromToken Only return connections starting with this token.
     * @param toToken Only return connections ending with this token.
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param allowBridges List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All bridges can be loaded from the /tools endpoint.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public connectionsGetWithHttpInfo(fromChain?: string, toChain?: string, fromToken?: string, toToken?: string, chainTypes?: string, allowBridges?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<ConnectionsResponse>> {
        const result = this.api.connectionsGetWithHttpInfo(fromChain, toChain, fromToken, toToken, chainTypes, allowBridges, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint gives information about all possible tranfers between chains. Since the result can be very large it is required to filter by at least a chain, a token, a bridge, or an exchange. Information about which chains and tokens are supported can be taken from the response of the /chains endpoint. Information about which bridges and exchanges are supported can be taken from the response of the /tools endpoint.
     * Returns all possible connections based on a from- or toChain.
     * @param fromChain The chain that should be the start of the possible connections.
     * @param toChain The chain that should be the end of the possible connections.
     * @param fromToken Only return connections starting with this token.
     * @param toToken Only return connections ending with this token.
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param allowBridges List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All bridges can be loaded from the /tools endpoint.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public connectionsGet(fromChain?: string, toChain?: string, fromToken?: string, toToken?: string, chainTypes?: string, allowBridges?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<ConnectionsResponse> {
        const result = this.api.connectionsGet(fromChain, toChain, fromToken, toToken, chainTypes, allowBridges, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
     * @param txHash The transaction hash that started the gas refilling process
     * @param chainId The chain where the deposit was originally made
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasRefetchGetWithHttpInfo(txHash: string, chainId: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<LIFuelStatus>> {
        const result = this.api.gasRefetchGetWithHttpInfo(txHash, chainId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
     * @param txHash The transaction hash that started the gas refilling process
     * @param chainId The chain where the deposit was originally made
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasRefetchGet(txHash: string, chainId: string, xLifiApiKey?: string, _options?: Configuration): Promise<LIFuelStatus> {
        const result = this.api.gasRefetchGet(txHash, chainId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Get status information about a lifuel transaction
     * @param txHash The transaction hash that started the gas refilling process
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasStatusGetWithHttpInfo(txHash: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<LIFuelStatus>> {
        const result = this.api.gasStatusGetWithHttpInfo(txHash, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Get status information about a lifuel transaction
     * @param txHash The transaction hash that started the gas refilling process
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasStatusGet(txHash: string, xLifiApiKey?: string, _options?: Configuration): Promise<LIFuelStatus> {
        const result = this.api.gasStatusGet(txHash, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.
     * Get a gas suggestion for the specified chain
     * @param chain Chain from which gas prices should be shown (can be a chain id or a chain key)
     * @param fromChain If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param fromToken If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasSuggestionChainGetWithHttpInfo(chain: string, fromChain?: string, fromToken?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<GasSuggestionResponse>> {
        const result = this.api.gasSuggestionChainGetWithHttpInfo(chain, fromChain, fromToken, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.
     * Get a gas suggestion for the specified chain
     * @param chain Chain from which gas prices should be shown (can be a chain id or a chain key)
     * @param fromChain If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param fromToken If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasSuggestionChainGet(chain: string, fromChain?: string, fromToken?: string, xLifiApiKey?: string, _options?: Configuration): Promise<GasSuggestionResponse> {
        const result = this.api.gasSuggestionChainGet(chain, fromChain, fromToken, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.
     * Get integrator\'s collected fees data for all supported chains
     * @param integratorId Address or the name of the integrator that requests fee balances
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public integratorsIntegratorIdGetWithHttpInfo(integratorId: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<IntegratorResponse>> {
        const result = this.api.integratorsIntegratorIdGetWithHttpInfo(integratorId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.
     * Get integrator\'s collected fees data for all supported chains
     * @param integratorId Address or the name of the integrator that requests fee balances
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public integratorsIntegratorIdGet(integratorId: string, xLifiApiKey?: string, _options?: Configuration): Promise<IntegratorResponse> {
        const result = this.api.integratorsIntegratorIdGet(integratorId, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.
     * Get transaction request for withdrawing collected integrator\'s fees by chain
     * @param integratorId Address or the name of the integrator that requests fee withdrawal
     * @param chainId Specify chainId from which funds should be withdrawn
     * @param tokenAddresses Specify tokens from which funds should be withdraw
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public integratorsIntegratorIdWithdrawChainIdGetWithHttpInfo(integratorId: string, chainId: string, tokenAddresses?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<IntegratorWithdrawalResponse>> {
        const result = this.api.integratorsIntegratorIdWithdrawChainIdGetWithHttpInfo(integratorId, chainId, tokenAddresses, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.
     * Get transaction request for withdrawing collected integrator\'s fees by chain
     * @param integratorId Address or the name of the integrator that requests fee withdrawal
     * @param chainId Specify chainId from which funds should be withdrawn
     * @param tokenAddresses Specify tokens from which funds should be withdraw
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public integratorsIntegratorIdWithdrawChainIdGet(integratorId: string, chainId: string, tokenAddresses?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<IntegratorWithdrawalResponse> {
        const result = this.api.integratorsIntegratorIdWithdrawChainIdGet(integratorId, chainId, tokenAddresses, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint has been deprecated in favour of /quote/contractCalls.
     * Perform a contract call across blockchains (BETA)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param contractCallRequest Object describing what tokens to transfer and how to interact with the destination contract.
     */
    public quoteContractCallPostWithHttpInfo(xLifiApiKey?: string, contractCallRequest?: ContractCallRequest, _options?: Configuration): Promise<HttpInfo<Tools>> {
        const result = this.api.quoteContractCallPostWithHttpInfo(xLifiApiKey, contractCallRequest, _options);
        return result.toPromise();
    }

    /**
     * This endpoint has been deprecated in favour of /quote/contractCalls.
     * Perform a contract call across blockchains (BETA)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param contractCallRequest Object describing what tokens to transfer and how to interact with the destination contract.
     */
    public quoteContractCallPost(xLifiApiKey?: string, contractCallRequest?: ContractCallRequest, _options?: Configuration): Promise<Tools> {
        const result = this.api.quoteContractCallPost(xLifiApiKey, contractCallRequest, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.
     * Perform multiple contract calls across blockchains (BETA)
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     * @param contractCallsRequest Object describing what tokens to transfer and how to interact with the destination contracts.
     */
    public quoteContractCallsPostWithHttpInfo(xLifiApiKey?: string, contractCallsRequest?: ContractCallsRequest, _options?: Configuration): Promise<HttpInfo<Tools>> {
        const result = this.api.quoteContractCallsPostWithHttpInfo(xLifiApiKey, contractCallsRequest, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.
     * Perform multiple contract calls across blockchains (BETA)
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     * @param contractCallsRequest Object describing what tokens to transfer and how to interact with the destination contracts.
     */
    public quoteContractCallsPost(xLifiApiKey?: string, contractCallsRequest?: ContractCallsRequest, _options?: Configuration): Promise<Tools> {
        const result = this.api.quoteContractCallsPost(xLifiApiKey, contractCallsRequest, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to request a quote for a transfer of one token to another, cross chain or not. The endpoint returns a `Step` object which contains information about the estimated result as well as a `transactionRequest` which can directly be sent to your wallet. The estimated result can be found inside the `estimate`, containing the estimated `toAmount` of the requested `Token` and the `toAmountMin`, which is the guaranteed minimum value that the transfer will yield including slippage. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-a-quote).
     * Get a quote for a token transfer
     * @param fromChain The sending chain. Can be the chain id or chain key
     * @param toChain The receiving chain. Can be the chain id or chain key
     * @param fromToken The token that should be transferred. Can be the address or the symbol
     * @param toToken The token that should be transferred to. Can be the address or the symbol
     * @param fromAddress The sending wallet address
     * @param fromAmount The amount that should be sent including all decimals (e.g. 1000000 for 1 USDC (6 decimals))
     * @param toAddress The receiving wallet address. If none is provided, the fromAddress will be used
     * @param order Which kind of route should be preferred **RECOMMENDED**: This sorting criterion aims to find a balance between cost and complexity, prioritizing affordable and less complex routes. It first sorts routes based on their cost and then focuses on the top 5% of the routes. These top routes are ranked by considering both their cheapness and ease of use. **FASTEST**: This sorting criterion prioritizes routes with the shortest estimated execution time. Users who value speed and want their transactions to be completed as quickly as possible should choose the fastest routes. **CHEAPEST**: This criterion focuses on minimizing the cost of the transaction, whether in token amount or USD amount (USD amount minus gas cost). Users looking for the most economical option should choose the cheapest routes. **SAFEST**: Sorting by this criterion emphasizes the safety and reliability of the routes. Routes are ranked based on the safety level of the tools (bridges) used in their steps. Users who prioritize security and want to minimize risks associated with their transactions should choose the safest routes. If two routes have the same safety level, they are further ranked based on their speed.
     * @param slippage The maximum allowed slippage for the transaction as a decimal value. 0.005 represents 0.5%.
     * @param integrator A string containing tracking information about the integrator of the API
     * @param fee The percent of the integrator\&#39;s fee that is taken from every transaction. 0.02 represents 2%. The maximum fee amount is 10%.
     * @param referrer A string containing tracking information about the referrer of the integrator
     * @param allowBridges List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param allowExchanges List of exchanges that are allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param denyBridges List of bridges that are not allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param denyExchanges List of exchanges that are not allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param preferBridges List of bridges that should be preferred for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param preferExchanges List of exchanges that should be preferred for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param allowDestinationCall Whether swaps or other contract calls should be allowed as part of the destination transaction of a bridge transfer. Separate swap transactions on the destination chain are not affected by this flag. By default, parameter is &#x60;true&#x60;.
     * @param maxPriceImpact The price impact threshold above which routes are hidden. As an example, one should specify 0.15 (15%) to hide routes with more than 15% price impact. The default is 10%.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public quoteGetWithHttpInfo(fromChain: string, toChain: string, fromToken: string, toToken: string, fromAddress: string, fromAmount: string, toAddress?: string, order?: 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST', slippage?: number, integrator?: string, fee?: number, referrer?: string, allowBridges?: Array<QuoteBridgesEnum>, allowExchanges?: Array<QuoteExchangesEnum>, denyBridges?: Array<QuoteBridgesEnum>, denyExchanges?: Array<QuoteExchangesEnum>, preferBridges?: Array<QuoteBridgesEnum>, preferExchanges?: Array<QuoteExchangesEnum>, allowDestinationCall?: boolean, maxPriceImpact?: number, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<Step>> {
        const result = this.api.quoteGetWithHttpInfo(fromChain, toChain, fromToken, toToken, fromAddress, fromAmount, toAddress, order, slippage, integrator, fee, referrer, allowBridges, allowExchanges, denyBridges, denyExchanges, preferBridges, preferExchanges, allowDestinationCall, maxPriceImpact, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to request a quote for a transfer of one token to another, cross chain or not. The endpoint returns a `Step` object which contains information about the estimated result as well as a `transactionRequest` which can directly be sent to your wallet. The estimated result can be found inside the `estimate`, containing the estimated `toAmount` of the requested `Token` and the `toAmountMin`, which is the guaranteed minimum value that the transfer will yield including slippage. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-a-quote).
     * Get a quote for a token transfer
     * @param fromChain The sending chain. Can be the chain id or chain key
     * @param toChain The receiving chain. Can be the chain id or chain key
     * @param fromToken The token that should be transferred. Can be the address or the symbol
     * @param toToken The token that should be transferred to. Can be the address or the symbol
     * @param fromAddress The sending wallet address
     * @param fromAmount The amount that should be sent including all decimals (e.g. 1000000 for 1 USDC (6 decimals))
     * @param toAddress The receiving wallet address. If none is provided, the fromAddress will be used
     * @param order Which kind of route should be preferred **RECOMMENDED**: This sorting criterion aims to find a balance between cost and complexity, prioritizing affordable and less complex routes. It first sorts routes based on their cost and then focuses on the top 5% of the routes. These top routes are ranked by considering both their cheapness and ease of use. **FASTEST**: This sorting criterion prioritizes routes with the shortest estimated execution time. Users who value speed and want their transactions to be completed as quickly as possible should choose the fastest routes. **CHEAPEST**: This criterion focuses on minimizing the cost of the transaction, whether in token amount or USD amount (USD amount minus gas cost). Users looking for the most economical option should choose the cheapest routes. **SAFEST**: Sorting by this criterion emphasizes the safety and reliability of the routes. Routes are ranked based on the safety level of the tools (bridges) used in their steps. Users who prioritize security and want to minimize risks associated with their transactions should choose the safest routes. If two routes have the same safety level, they are further ranked based on their speed.
     * @param slippage The maximum allowed slippage for the transaction as a decimal value. 0.005 represents 0.5%.
     * @param integrator A string containing tracking information about the integrator of the API
     * @param fee The percent of the integrator\&#39;s fee that is taken from every transaction. 0.02 represents 2%. The maximum fee amount is 10%.
     * @param referrer A string containing tracking information about the referrer of the integrator
     * @param allowBridges List of bridges that are allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param allowExchanges List of exchanges that are allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param denyBridges List of bridges that are not allowed for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param denyExchanges List of exchanges that are not allowed for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param preferBridges List of bridges that should be preferred for this transaction. Currently available bridges are for example &#x60;hop&#x60;, &#x60;multichain&#x60; or &#x60;connext&#x60;. All supported bridges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param preferExchanges List of exchanges that should be preferred for this transaction. Currently available exchanges are aggregators such as &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60; and &#x60;0x&#x60; and a lot of dexes. All supported exchanges can be loaded from the /tools endpoint. Also values &#x60;all&#x60;, &#x60;none&#x60;, &#x60;default&#x60; and &#x60;[]&#x60; are acceptable and mean all tools of the current type (&#x60;all&#x60;), no tools (for &#x60;none&#x60; and &#x60;[]&#x60; cases) and default tool\&#39;s settings on the current stage.
     * @param allowDestinationCall Whether swaps or other contract calls should be allowed as part of the destination transaction of a bridge transfer. Separate swap transactions on the destination chain are not affected by this flag. By default, parameter is &#x60;true&#x60;.
     * @param maxPriceImpact The price impact threshold above which routes are hidden. As an example, one should specify 0.15 (15%) to hide routes with more than 15% price impact. The default is 10%.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public quoteGet(fromChain: string, toChain: string, fromToken: string, toToken: string, fromAddress: string, fromAmount: string, toAddress?: string, order?: 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST', slippage?: number, integrator?: string, fee?: number, referrer?: string, allowBridges?: Array<QuoteBridgesEnum>, allowExchanges?: Array<QuoteExchangesEnum>, denyBridges?: Array<QuoteBridgesEnum>, denyExchanges?: Array<QuoteExchangesEnum>, preferBridges?: Array<QuoteBridgesEnum>, preferExchanges?: Array<QuoteExchangesEnum>, allowDestinationCall?: boolean, maxPriceImpact?: number, xLifiApiKey?: string, _options?: Configuration): Promise<Step> {
        const result = this.api.quoteGet(fromChain, toChain, fromToken, toToken, fromAddress, fromAmount, toAddress, order, slippage, integrator, fee, referrer, allowBridges, allowExchanges, denyBridges, denyExchanges, preferBridges, preferExchanges, allowDestinationCall, maxPriceImpact, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Cross chain transfers might take a while to complete. Waiting on the transaction on the sending chain doesn\'t help here. For this reason we build a simple endpoint that let\'s you check the status of your transfer. Important: The endpoint returns a `200` successful response even if the transaction can not be found. This behavior accounts for the case that the transaction hash is valid but the transaction has not been mined yet. While non of the parameters `fromChain`, `toChain` and `bridge` are required, passing the `fromChain` parameter will speed up the request and is therefore encouraged. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/checking-the-status-of-a-transaction).
     * Check the status of a cross chain transfer
     * @param txHash The transaction hash on the sending chain
     * @param bridge The bridging tool used for the transfer
     * @param fromChain The sending chain. Can be the chain id or chain key
     * @param toChain The receiving chain. Can be the chain id or chain key
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public statusGetWithHttpInfo(txHash: string, bridge?: BridgesEnum, fromChain?: string, toChain?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<StatusResponse>> {
        const result = this.api.statusGetWithHttpInfo(txHash, bridge, fromChain, toChain, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * Cross chain transfers might take a while to complete. Waiting on the transaction on the sending chain doesn\'t help here. For this reason we build a simple endpoint that let\'s you check the status of your transfer. Important: The endpoint returns a `200` successful response even if the transaction can not be found. This behavior accounts for the case that the transaction hash is valid but the transaction has not been mined yet. While non of the parameters `fromChain`, `toChain` and `bridge` are required, passing the `fromChain` parameter will speed up the request and is therefore encouraged. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/checking-the-status-of-a-transaction).
     * Check the status of a cross chain transfer
     * @param txHash The transaction hash on the sending chain
     * @param bridge The bridging tool used for the transfer
     * @param fromChain The sending chain. Can be the chain id or chain key
     * @param toChain The receiving chain. Can be the chain id or chain key
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public statusGet(txHash: string, bridge?: BridgesEnum, fromChain?: string, toChain?: string, xLifiApiKey?: string, _options?: Configuration): Promise<StatusResponse> {
        const result = this.api.statusGet(txHash, bridge, fromChain, toChain, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).
     * Fetch information about a Token
     * @param chain Id or key of the chain that contains the token
     * @param token Address or symbol of the token on the requested chain
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public tokenGetWithHttpInfo(chain: string, token: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<Array<Token>>> {
        const result = this.api.tokenGetWithHttpInfo(chain, token, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).
     * Fetch information about a Token
     * @param chain Id or key of the chain that contains the token
     * @param token Address or symbol of the token on the requested chain
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public tokenGet(chain: string, token: string, xLifiApiKey?: string, _options?: Configuration): Promise<Token> {
        const result = this.api.tokenGet(chain, token, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to fetch all tokens known to the LI.FI services.
     * Fetch all known tokens
     * @param chains Restrict the resulting tokens to the given chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public tokensGetWithHttpInfo(chains?: string, chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<TokensGet200Response>> {
        const result = this.api.tokensGetWithHttpInfo(chains, chainTypes, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to fetch all tokens known to the LI.FI services.
     * Fetch all known tokens
     * @param chains Restrict the resulting tokens to the given chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public tokensGet(chains?: string, chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<TokensGet200Response> {
        const result = this.api.tokensGet(chains, chainTypes, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get information about the bridges and exchanges available trough our service
     * Get available bridges and exchanges
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public toolsGetWithHttpInfo(xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<Tools>> {
        const result = this.api.toolsGetWithHttpInfo(xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get information about the bridges and exchanges available trough our service
     * Get available bridges and exchanges
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public toolsGet(xLifiApiKey?: string, _options?: Configuration): Promise<Tools> {
        const result = this.api.toolsGet(xLifiApiKey, _options);
        return result.toPromise();
    }


}



import { ObservableGasApi } from './ObservableAPI';

import { GasApiRequestFactory, GasApiResponseProcessor } from "../apis/GasApi";
import { GasSuggestionResponse } from '../models/GasSuggestion';
export class PromiseGasApi {
    private api: ObservableGasApi

    public constructor(
        configuration: Configuration,
        requestFactory?: GasApiRequestFactory,
        responseProcessor?: GasApiResponseProcessor
    ) {
        this.api = new ObservableGasApi(configuration, requestFactory, responseProcessor);
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the supplied chainId.
     * Get gas price for the specified chainId
     * @param chainId ChaindId from which gas prices should be shown
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasPricesChainIdGetWithHttpInfo(chainId: string, refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<GasPrice>> {
        const result = this.api.gasPricesChainIdGetWithHttpInfo(chainId, refresh, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the supplied chainId.
     * Get gas price for the specified chainId
     * @param chainId ChaindId from which gas prices should be shown
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasPricesChainIdGet(chainId: string, refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<GasPrice> {
        const result = this.api.gasPricesChainIdGet(chainId, refresh, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the enabled chains in the server.
     * Get gas prices for enabled chains
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasPricesGetWithHttpInfo(refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<HttpInfo<GasPrice>> {
        const result = this.api.gasPricesGetWithHttpInfo(refresh, xLifiApiKey, _options);
        return result.toPromise();
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the enabled chains in the server.
     * Get gas prices for enabled chains
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public gasPricesGet(refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<GasPrice> {
        const result = this.api.gasPricesGet(refresh, xLifiApiKey, _options);
        return result.toPromise();
    }


}



