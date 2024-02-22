// TODO: better import syntax?
import { BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS } from './baseapi';
import { Configuration } from '../configuration';
import { RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo } from '../http/http';
import { GasSuggestionResponse, ObjectSerializer } from '../models/ObjectSerializer';
import { ApiException } from './exception';
import { canConsumeForm, isCodeInRange } from '../util';
import { SecurityAuthentication } from '../auth/auth';


import { BridgesEnum } from '../models/BridgesEnum';
import { ChainsResponse } from '../models/ChainsResponse';
import { ConnectionsResponse } from '../models/ConnectionsResponse';
import { ContractCallRequest } from '../models/ContractCallRequest';
import { ContractCallsRequest } from '../models/ContractCallsRequest';
import { IntegratorResponse } from '../models/IntegratorResponse';
import { IntegratorWithdrawalResponse } from '../models/IntegratorWithdrawalResponse';
import { LIFuelStatus } from '../models/LIFuelStatus';
import { QuoteBridgesEnum } from '../models/QuoteBridgesEnum';
import { QuoteExchangesEnum } from '../models/QuoteExchangesEnum';
import { QuoteGet404Response } from '../models/QuoteGet404Response';
import { StatusResponse } from '../models/StatusResponse';
import { Step } from '../models/Step';
import { Token } from '../models/Token';
import { TokensGet200Response } from '../models/TokensGet200Response';
import { Tools } from '../models/Tools';
import { WalletAnalyticsResponse } from '../models/WalletAnalyticsResponse';

/**
 * no description
 */
export class DefaultApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * This endpoint can be used to retrieve a list of transfers filtered by certain properties. Returns a maximum of 1000 transfers.
     * Get a list of filtered transfers
     * @param integrator The integrator string to filter by
     * @param wallet The sending OR receiving wallet address 
     * @param status The status of the transfers. Possible values are &#x60;ALL&#x60;, &#x60;DONE&#x60;, &#x60;PENDING&#x60;, and &#x60;FAILED&#x60;. The default is &#x60;DONE&#x60;
     * @param fromTimestamp The oldest timestamp that should be taken into consideration. Defaults to 30 days ago
     * @param toTimestamp The newest timestamp that should be taken into consideration. Defaults to now
     */
    public async analyticsTransfersGet(integrator: string, wallet?: string, status?: string, fromTimestamp?: number, toTimestamp?: number, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'integrator' is not null or undefined
        if (integrator === null || integrator === undefined) {
            throw new RequiredError("DefaultApi", "analyticsTransfersGet", "integrator");
        }






        // Path Params
        const localVarPath = '/analytics/transfers';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (integrator !== undefined) {
            requestContext.setQueryParam("integrator", ObjectSerializer.serialize(integrator, "string", ""));
        }

        // Query Params
        if (wallet !== undefined) {
            requestContext.setQueryParam("wallet", ObjectSerializer.serialize(wallet, "string", ""));
        }

        // Query Params
        if (status !== undefined) {
            requestContext.setQueryParam("status", ObjectSerializer.serialize(status, "string", ""));
        }

        // Query Params
        if (fromTimestamp !== undefined) {
            requestContext.setQueryParam("fromTimestamp", ObjectSerializer.serialize(fromTimestamp, "number", ""));
        }

        // Query Params
        if (toTimestamp !== undefined) {
            requestContext.setQueryParam("toTimestamp", ObjectSerializer.serialize(toTimestamp, "number", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
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
    public async analyticsWalletsWalletAddressGet(walletAddress: string, integrator: string, fromTimestamp?: number, toTimestamp?: number, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'walletAddress' is not null or undefined
        if (walletAddress === null || walletAddress === undefined) {
            throw new RequiredError("DefaultApi", "analyticsWalletsWalletAddressGet", "walletAddress");
        }


        // verify required parameter 'integrator' is not null or undefined
        if (integrator === null || integrator === undefined) {
            throw new RequiredError("DefaultApi", "analyticsWalletsWalletAddressGet", "integrator");
        }





        // Path Params
        const localVarPath = '/analytics/wallets/{wallet_address}'
            .replace('{' + 'wallet_address' + '}', encodeURIComponent(String(walletAddress)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (integrator !== undefined) {
            requestContext.setQueryParam("integrator", ObjectSerializer.serialize(integrator, "string", ""));
        }

        // Query Params
        if (fromTimestamp !== undefined) {
            requestContext.setQueryParam("fromTimestamp", ObjectSerializer.serialize(fromTimestamp, "number", ""));
        }

        // Query Params
        if (toTimestamp !== undefined) {
            requestContext.setQueryParam("toTimestamp", ObjectSerializer.serialize(toTimestamp, "number", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint allows to pass transaction call data. It will then parse the call data based on known and on-chain ABIs to provide a JSON overview of the internal transaction information.
     * Parse transaction call data (BETA)
     * @param callData The call data to parse
     * @param chainId The chainId that the transaction is built for (or has been sent on)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async calldataParseGet(callData: string, chainId?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'callData' is not null or undefined
        if (callData === null || callData === undefined) {
            throw new RequiredError("DefaultApi", "calldataParseGet", "callData");
        }




        // Path Params
        const localVarPath = '/calldata/parse';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (chainId !== undefined) {
            requestContext.setQueryParam("chainId", ObjectSerializer.serialize(chainId, "string", ""));
        }

        // Query Params
        if (callData !== undefined) {
            requestContext.setQueryParam("callData", ObjectSerializer.serialize(callData, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/requesting-supported-chains).
     * Get information about all currently supported chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     */
    public async chainsGet(chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/chains';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (chainTypes !== undefined) {
            requestContext.setQueryParam("chainTypes", ObjectSerializer.serialize(chainTypes, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
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
    public async connectionsGet(fromChain?: string, toChain?: string, fromToken?: string, toToken?: string, chainTypes?: string, allowBridges?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;








        // Path Params
        const localVarPath = '/connections';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (fromChain !== undefined) {
            requestContext.setQueryParam("fromChain", ObjectSerializer.serialize(fromChain, "string", ""));
        }

        // Query Params
        if (toChain !== undefined) {
            requestContext.setQueryParam("toChain", ObjectSerializer.serialize(toChain, "string", ""));
        }

        // Query Params
        if (fromToken !== undefined) {
            requestContext.setQueryParam("fromToken", ObjectSerializer.serialize(fromToken, "string", ""));
        }

        // Query Params
        if (toToken !== undefined) {
            requestContext.setQueryParam("toToken", ObjectSerializer.serialize(toToken, "string", ""));
        }

        // Query Params
        if (chainTypes !== undefined) {
            requestContext.setQueryParam("chainTypes", ObjectSerializer.serialize(chainTypes, "string", ""));
        }

        // Query Params
        if (allowBridges !== undefined) {
            requestContext.setQueryParam("allowBridges", ObjectSerializer.serialize(allowBridges, "Array<string>", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * In case a transaction was missed by a relayer, this endpoint can be used to force a the tx to be refetched
     * @param txHash The transaction hash that started the gas refilling process
     * @param chainId The chain where the deposit was originally made
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async gasRefetchGet(txHash: string, chainId: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'txHash' is not null or undefined
        if (txHash === null || txHash === undefined) {
            throw new RequiredError("DefaultApi", "gasRefetchGet", "txHash");
        }


        // verify required parameter 'chainId' is not null or undefined
        if (chainId === null || chainId === undefined) {
            throw new RequiredError("DefaultApi", "gasRefetchGet", "chainId");
        }



        // Path Params
        const localVarPath = '/gas/refetch';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (txHash !== undefined) {
            requestContext.setQueryParam("txHash", ObjectSerializer.serialize(txHash, "string", ""));
        }

        // Query Params
        if (chainId !== undefined) {
            requestContext.setQueryParam("chainId", ObjectSerializer.serialize(chainId, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Get status information about a lifuel transaction
     * @param txHash The transaction hash that started the gas refilling process
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async gasStatusGet(txHash: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'txHash' is not null or undefined
        if (txHash === null || txHash === undefined) {
            throw new RequiredError("DefaultApi", "gasStatusGet", "txHash");
        }



        // Path Params
        const localVarPath = '/gas/status';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (txHash !== undefined) {
            requestContext.setQueryParam("txHash", ObjectSerializer.serialize(txHash, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * Endpoint to retrieve a suggestion on how much gas is needed on the requested chain. The suggestion is based on the average price of 10 approvals and 10 uniswap based swaps via LI.FI on the specified chain. If `fromChain` and `fromToken` are specified, the result will contain information about how much `fromToken` amount the user has to send to receive the suggested gas amount on the requested chain.
     * Get a gas suggestion for the specified chain
     * @param chain Chain from which gas prices should be shown (can be a chain id or a chain key)
     * @param fromChain If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param fromToken If &#x60;fromChain&#x60; and &#x60;fromToken&#x60; are specified, the result will contain information about how much &#x60;fromToken&#x60; amount the user has to send to receive the suggested gas amount on the requested chain.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async gasSuggestionChainGet(chain: string, fromChain?: string, fromToken?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'chain' is not null or undefined
        if (chain === null || chain === undefined) {
            throw new RequiredError("DefaultApi", "gasSuggestionChainGet", "chain");
        }





        // Path Params
        const localVarPath = '/gas/suggestion/{chain}'
            .replace('{' + 'chain' + '}', encodeURIComponent(String(chain)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (fromChain !== undefined) {
            requestContext.setQueryParam("fromChain", ObjectSerializer.serialize(fromChain, "string", ""));
        }

        // Query Params
        if (fromToken !== undefined) {
            requestContext.setQueryParam("fromToken", ObjectSerializer.serialize(fromToken, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to request all integrator\'s collected fees data by tokens for all supported chains. The endpoint returns an `Integrator` object which contains the integrator name (or the address if the name wasn\'t found in configurations) and an array of fee balances for all supported chains.
     * Get integrator\'s collected fees data for all supported chains
     * @param integratorId Address or the name of the integrator that requests fee balances
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async integratorsIntegratorIdGet(integratorId: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'integratorId' is not null or undefined
        if (integratorId === null || integratorId === undefined) {
            throw new RequiredError("DefaultApi", "integratorsIntegratorIdGet", "integratorId");
        }



        // Path Params
        const localVarPath = '/integrators/{integratorId}'
            .replace('{' + 'integratorId' + '}', encodeURIComponent(String(integratorId)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to get transaction request for withdrawing integrator\'s collected fees the specified chain. If a list of token addresses is provided, the generated transaction will only withdraw the specified funds. If there is no collected fees for the provided token\'s addresses, the `400` error will be thrown. The endpoint returns a `IntegratorWithdrawalTransactionResponse` object which contains the transaction request.
     * Get transaction request for withdrawing collected integrator\'s fees by chain
     * @param integratorId Address or the name of the integrator that requests fee withdrawal
     * @param chainId Specify chainId from which funds should be withdrawn
     * @param tokenAddresses Specify tokens from which funds should be withdraw
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async integratorsIntegratorIdWithdrawChainIdGet(integratorId: string, chainId: string, tokenAddresses?: Array<string>, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'integratorId' is not null or undefined
        if (integratorId === null || integratorId === undefined) {
            throw new RequiredError("DefaultApi", "integratorsIntegratorIdWithdrawChainIdGet", "integratorId");
        }


        // verify required parameter 'chainId' is not null or undefined
        if (chainId === null || chainId === undefined) {
            throw new RequiredError("DefaultApi", "integratorsIntegratorIdWithdrawChainIdGet", "chainId");
        }




        // Path Params
        const localVarPath = '/integrators/{integratorId}/withdraw/{chainId}'
            .replace('{' + 'integratorId' + '}', encodeURIComponent(String(integratorId)))
            .replace('{' + 'chainId' + '}', encodeURIComponent(String(chainId)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (tokenAddresses !== undefined) {
            requestContext.setQueryParam("tokenAddresses", ObjectSerializer.serialize(tokenAddresses, "Array<string>", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint has been deprecated in favour of /quote/contractCalls.
     * Perform a contract call across blockchains (BETA)
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param contractCallRequest Object describing what tokens to transfer and how to interact with the destination contract.
     */
    public async quoteContractCallPost(xLifiApiKey?: string, contractCallRequest?: ContractCallRequest, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/quote/contractCall';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.POST);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(contractCallRequest, "ContractCallRequest", ""),
            contentType
        );
        requestContext.setBody(serializedBody);


        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to bridge tokens, swap them and perform a number or arbitrary contract calls on the destination chain. You can find an example of it [here](https://github.com/lifinance/sdk/tree/main/examples). This functionality is currently in beta. While we\'ve worked hard to ensure its stability and functionality, there might still be some rough edges.
     * Perform multiple contract calls across blockchains (BETA)
     * @param xLifiApiKey The apiKey allows you to authenticate on the API.
     * @param contractCallsRequest Object describing what tokens to transfer and how to interact with the destination contracts.
     */
    public async quoteContractCallsPost(xLifiApiKey?: string, contractCallsRequest?: ContractCallsRequest, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/quote/contractCalls';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.POST);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }


        // Body Params
        const contentType = ObjectSerializer.getPreferredMediaType([
            "application/json"
        ]);
        requestContext.setHeaderParam("Content-Type", contentType);
        const serializedBody = ObjectSerializer.stringify(
            ObjectSerializer.serialize(contractCallsRequest, "ContractCallsRequest", ""),
            contentType
        );
        requestContext.setBody(serializedBody);


        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
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
    public async quoteGet(fromChain: string, toChain: string, fromToken: string, toToken: string, fromAddress: string, fromAmount: string, toAddress?: string, order?: 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST', slippage?: number, integrator?: string, fee?: number, referrer?: string, allowBridges?: Array<QuoteBridgesEnum>, allowExchanges?: Array<QuoteExchangesEnum>, denyBridges?: Array<QuoteBridgesEnum>, denyExchanges?: Array<QuoteExchangesEnum>, preferBridges?: Array<QuoteBridgesEnum>, preferExchanges?: Array<QuoteExchangesEnum>, allowDestinationCall?: boolean, maxPriceImpact?: number, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'fromChain' is not null or undefined
        if (fromChain === null || fromChain === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "fromChain");
        }


        // verify required parameter 'toChain' is not null or undefined
        if (toChain === null || toChain === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "toChain");
        }


        // verify required parameter 'fromToken' is not null or undefined
        if (fromToken === null || fromToken === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "fromToken");
        }


        // verify required parameter 'toToken' is not null or undefined
        if (toToken === null || toToken === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "toToken");
        }


        // verify required parameter 'fromAddress' is not null or undefined
        if (fromAddress === null || fromAddress === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "fromAddress");
        }


        // verify required parameter 'fromAmount' is not null or undefined
        if (fromAmount === null || fromAmount === undefined) {
            throw new RequiredError("DefaultApi", "quoteGet", "fromAmount");
        }

















        // Path Params
        const localVarPath = '/quote';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (fromChain !== undefined) {
            requestContext.setQueryParam("fromChain", ObjectSerializer.serialize(fromChain, "string", ""));
        }

        // Query Params
        if (toChain !== undefined) {
            requestContext.setQueryParam("toChain", ObjectSerializer.serialize(toChain, "string", ""));
        }

        // Query Params
        if (fromToken !== undefined) {
            requestContext.setQueryParam("fromToken", ObjectSerializer.serialize(fromToken, "string", ""));
        }

        // Query Params
        if (toToken !== undefined) {
            requestContext.setQueryParam("toToken", ObjectSerializer.serialize(toToken, "string", ""));
        }

        // Query Params
        if (fromAddress !== undefined) {
            requestContext.setQueryParam("fromAddress", ObjectSerializer.serialize(fromAddress, "string", ""));
        }

        // Query Params
        if (toAddress !== undefined) {
            requestContext.setQueryParam("toAddress", ObjectSerializer.serialize(toAddress, "string", ""));
        }

        // Query Params
        if (fromAmount !== undefined) {
            requestContext.setQueryParam("fromAmount", ObjectSerializer.serialize(fromAmount, "string", ""));
        }

        // Query Params
        if (order !== undefined) {
            requestContext.setQueryParam("order", ObjectSerializer.serialize(order, "'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST'", ""));
        }

        // Query Params
        if (slippage !== undefined) {
            requestContext.setQueryParam("slippage", ObjectSerializer.serialize(slippage, "number", ""));
        }

        // Query Params
        if (integrator !== undefined) {
            requestContext.setQueryParam("integrator", ObjectSerializer.serialize(integrator, "string", ""));
        }

        // Query Params
        if (fee !== undefined) {
            requestContext.setQueryParam("fee", ObjectSerializer.serialize(fee, "number", ""));
        }

        // Query Params
        if (referrer !== undefined) {
            requestContext.setQueryParam("referrer", ObjectSerializer.serialize(referrer, "string", ""));
        }

        // Query Params
        if (allowBridges !== undefined) {
            requestContext.setQueryParam("allowBridges", ObjectSerializer.serialize(allowBridges, "Array<QuoteBridgesEnum>", ""));
        }

        // Query Params
        if (allowExchanges !== undefined) {
            requestContext.setQueryParam("allowExchanges", ObjectSerializer.serialize(allowExchanges, "Array<QuoteExchangesEnum>", ""));
        }

        // Query Params
        if (denyBridges !== undefined) {
            requestContext.setQueryParam("denyBridges", ObjectSerializer.serialize(denyBridges, "Array<QuoteBridgesEnum>", ""));
        }

        // Query Params
        if (denyExchanges !== undefined) {
            requestContext.setQueryParam("denyExchanges", ObjectSerializer.serialize(denyExchanges, "Array<QuoteExchangesEnum>", ""));
        }

        // Query Params
        if (preferBridges !== undefined) {
            requestContext.setQueryParam("preferBridges", ObjectSerializer.serialize(preferBridges, "Array<QuoteBridgesEnum>", ""));
        }

        // Query Params
        if (preferExchanges !== undefined) {
            requestContext.setQueryParam("preferExchanges", ObjectSerializer.serialize(preferExchanges, "Array<QuoteExchangesEnum>", ""));
        }

        // Query Params
        if (allowDestinationCall !== undefined) {
            requestContext.setQueryParam("allowDestinationCall", ObjectSerializer.serialize(allowDestinationCall, "boolean", ""));
        }

        // Query Params
        if (maxPriceImpact !== undefined) {
            requestContext.setQueryParam("maxPriceImpact", ObjectSerializer.serialize(maxPriceImpact, "number", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
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
    public async statusGet(txHash: string, bridge?: BridgesEnum, fromChain?: string, toChain?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'txHash' is not null or undefined
        if (txHash === null || txHash === undefined) {
            throw new RequiredError("DefaultApi", "statusGet", "txHash");
        }






        // Path Params
        const localVarPath = '/status';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (txHash !== undefined) {
            requestContext.setQueryParam("txHash", ObjectSerializer.serialize(txHash, "string", ""));
        }

        // Query Params
        if (bridge !== undefined) {
            requestContext.setQueryParam("bridge", ObjectSerializer.serialize(bridge, "BridgesEnum", ""));
        }

        // Query Params
        if (fromChain !== undefined) {
            requestContext.setQueryParam("fromChain", ObjectSerializer.serialize(fromChain, "string", ""));
        }

        // Query Params
        if (toChain !== undefined) {
            requestContext.setQueryParam("toChain", ObjectSerializer.serialize(toChain, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to get more information about a token by its address or symbol and its chain. If you want to learn more about how to use this endpoint please have a look at our [guide](https://docs.li.fi/more-integration-options/li.fi-api/getting-token-information).
     * Fetch information about a Token
     * @param chain Id or key of the chain that contains the token
     * @param token Address or symbol of the token on the requested chain
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async tokenGet(chain: string, token: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;

        // verify required parameter 'chain' is not null or undefined
        if (chain === null || chain === undefined) {
            throw new RequiredError("DefaultApi", "tokenGet", "chain");
        }


        // verify required parameter 'token' is not null or undefined
        if (token === null || token === undefined) {
            throw new RequiredError("DefaultApi", "tokenGet", "token");
        }



        // Path Params
        const localVarPath = '/token';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (chain !== undefined) {
            requestContext.setQueryParam("chain", ObjectSerializer.serialize(chain, "string", ""));
        }

        // Query Params
        if (token !== undefined) {
            requestContext.setQueryParam("token", ObjectSerializer.serialize(token, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to fetch all tokens known to the LI.FI services.
     * Fetch all known tokens
     * @param chains Restrict the resulting tokens to the given chains
     * @param chainTypes Restrict the resulting tokens to the given chainTypes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async tokensGet(chains?: string, chainTypes?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;




        // Path Params
        const localVarPath = '/tokens';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (chains !== undefined) {
            requestContext.setQueryParam("chains", ObjectSerializer.serialize(chains, "string", ""));
        }

        // Query Params
        if (chainTypes !== undefined) {
            requestContext.setQueryParam("chainTypes", ObjectSerializer.serialize(chainTypes, "string", ""));
        }

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to get information about the bridges and exchanges available trough our service
     * Get available bridges and exchanges
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async toolsGet(xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        const _config = _options || this.configuration;


        // Path Params
        const localVarPath = '/tools';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Header Params
        if (xLifiApiKey) {
            requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));
        }



        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class DefaultApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to analyticsTransfersGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async analyticsTransfersGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<any>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: any = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "any", ""
            ) as any;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: any = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "any", ""
            ) as any;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to analyticsWalletsWalletAddressGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async analyticsWalletsWalletAddressGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<WalletAnalyticsResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: WalletAnalyticsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WalletAnalyticsResponse", ""
            ) as WalletAnalyticsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: WalletAnalyticsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "WalletAnalyticsResponse", ""
            ) as WalletAnalyticsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to calldataParseGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async calldataParseGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<void>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, undefined);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: void = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "void", ""
            ) as void;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to chainsGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async chainsGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<ChainsResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: ChainsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ChainsResponse", ""
            ) as ChainsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: ChainsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ChainsResponse", ""
            ) as ChainsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to connectionsGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async connectionsGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<ConnectionsResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: ConnectionsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ConnectionsResponse", ""
            ) as ConnectionsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: ConnectionsResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "ConnectionsResponse", ""
            ) as ConnectionsResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to gasRefetchGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async gasRefetchGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<LIFuelStatus>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: LIFuelStatus = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "LIFuelStatus", ""
            ) as LIFuelStatus;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: LIFuelStatus = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "LIFuelStatus", ""
            ) as LIFuelStatus;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to gasStatusGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async gasStatusGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<LIFuelStatus>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: LIFuelStatus = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "LIFuelStatus", ""
            ) as LIFuelStatus;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: LIFuelStatus = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "LIFuelStatus", ""
            ) as LIFuelStatus;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to gasSuggestionChainGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async gasSuggestionChainGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<GasSuggestionResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: GasSuggestionResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasSuggestionResponse", ""
            ) as GasSuggestionResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: GasSuggestionResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasSuggestionResponse", ""
            ) as GasSuggestionResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to integratorsIntegratorIdGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async integratorsIntegratorIdGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<IntegratorResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: IntegratorResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "IntegratorResponse", ""
            ) as IntegratorResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Integrator with the name ${integratorId} is not found", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: IntegratorResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "IntegratorResponse", ""
            ) as IntegratorResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to integratorsIntegratorIdWithdrawChainIdGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async integratorsIntegratorIdWithdrawChainIdGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<IntegratorWithdrawalResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: IntegratorWithdrawalResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "IntegratorWithdrawalResponse", ""
            ) as IntegratorWithdrawalResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "None of the requested tokens has a balance", undefined, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Integrator with the name ${integratorId} is not found", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: IntegratorWithdrawalResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "IntegratorWithdrawalResponse", ""
            ) as IntegratorWithdrawalResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to quoteContractCallPost
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async quoteContractCallPostWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Tools>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to quoteContractCallsPost
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async quoteContractCallsPostWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Tools>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to quoteGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async quoteGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Step>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Step = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Step", ""
            ) as Step;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Invalid quote request", undefined, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            const body: QuoteGet404Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "QuoteGet404Response", ""
            ) as QuoteGet404Response;
            throw new ApiException<QuoteGet404Response>(response.httpStatusCode, "Unable to find a quote for the requested transfer.", body, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Step = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Step", ""
            ) as Step;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to statusGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async statusGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<StatusResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: StatusResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "StatusResponse", ""
            ) as StatusResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "The passed parameters are invalid", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: StatusResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "StatusResponse", ""
            ) as StatusResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to tokenGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async tokenGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Token>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Token = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Token", ""
            ) as Token;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "User passed an invalid chain id or abbrevation", undefined, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "No token found for the given address and chain", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Token = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Token", ""
            ) as Token;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to tokensGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async tokensGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<TokensGet200Response>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const txt = await response.body.text()
            const body: TokensGet200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(txt, contentType),
                "TokensGet200Response", ""
            ) as TokensGet200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: TokensGet200Response = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "TokensGet200Response", ""
            ) as TokensGet200Response;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to toolsGet
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async toolsGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Tools>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: Tools = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Tools", ""
            ) as Tools;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
