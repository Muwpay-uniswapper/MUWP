// TODO: better import syntax?
import {BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS} from './baseapi';
import {Configuration} from '../configuration';
import {RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo} from '../http/http';
import {ObjectSerializer} from '../models/ObjectSerializer';
import {ApiException} from './exception';
import {canConsumeForm, isCodeInRange} from '../util';
import {SecurityAuthentication} from '../auth/auth';


import { GasPrice } from '../models/GasPrice';

/**
 * no description
 */
export class GasApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * This endpoint can be used to get the most recent gas prices for the supplied chainId.
     * Get gas price for the specified chainId
     * @param chainId ChaindId from which gas prices should be shown
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async gasPricesChainIdGet(chainId: string, refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'chainId' is not null or undefined
        if (chainId === null || chainId === undefined) {
            throw new RequiredError("GasApi", "gasPricesChainIdGet", "chainId");
        }




        // Path Params
        const localVarPath = '/gas/prices/{chainId}'
            .replace('{' + 'chainId' + '}', encodeURIComponent(String(chainId)));

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (refresh !== undefined) {
            requestContext.setQueryParam("refresh", ObjectSerializer.serialize(refresh, "string", ""));
        }

        // Header Params
        requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));


        
        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

    /**
     * This endpoint can be used to get the most recent gas prices for the enabled chains in the server.
     * Get gas prices for enabled chains
     * @param refresh If true it wil get the freshest gas prices available.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async gasPricesGet(refresh?: string, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/gas/prices';

        // Make Request Context
        const requestContext = _config.baseServer.makeRequestContext(localVarPath, HttpMethod.GET);
        requestContext.setHeaderParam("Accept", "application/json, */*;q=0.8")

        // Query Params
        if (refresh !== undefined) {
            requestContext.setQueryParam("refresh", ObjectSerializer.serialize(refresh, "string", ""));
        }

        // Header Params
        requestContext.setHeaderParam("x-lifi-api-key", ObjectSerializer.serialize(xLifiApiKey, "string", ""));


        
        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class GasApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to gasPricesChainIdGet
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async gasPricesChainIdGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<GasPrice >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: GasPrice = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasPrice", ""
            ) as GasPrice;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Invalid Routes Request", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: GasPrice = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasPrice", ""
            ) as GasPrice;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to gasPricesGet
     * @throws ApiException if the response code was not in [200, 299]
     */
     public async gasPricesGetWithHttpInfo(response: ResponseContext): Promise<HttpInfo<GasPrice >> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: GasPrice = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasPrice", ""
            ) as GasPrice;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: GasPrice = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "GasPrice", ""
            ) as GasPrice;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

}
