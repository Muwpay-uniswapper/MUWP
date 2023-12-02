// TODO: better import syntax?
import { BaseAPIRequestFactory, RequiredError, COLLECTION_FORMATS } from './baseapi';
import { Configuration } from '../configuration';
import { RequestContext, HttpMethod, ResponseContext, HttpFile, HttpInfo } from '../http/http';
import { ObjectSerializer } from '../models/ObjectSerializer';
import { ApiException } from './exception';
import { canConsumeForm, isCodeInRange } from '../util';
import { SecurityAuthentication } from '../auth/auth';


import { PossibilitiesResponse } from '../models/PossibilitiesResponse';
import { PossiblitiesRequest } from '../models/PossiblitiesRequest';
import { RoutesRequest } from '../models/RoutesRequest';
import { RoutesResponse } from '../models/RoutesResponse';
import { Step } from '../models/Step';

/**
 * no description
 */
export class AdvancedApiRequestFactory extends BaseAPIRequestFactory {

    /**
     * Get a set of current possibilities based on a request that specifies which chains, exchanges and bridges are preferred or unwanted. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get information about available services, chains and tokens
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     * @param possiblitiesRequest Object defining preferences regarding chain, exchanges and bridges. Currently available exchanges are: &#x60;1inch&#x60;, &#x60;paraswap&#x60;, &#x60;openocean&#x60;, &#x60;0x&#x60;. Currently available bridges are &#x60;hop&#x60;, &#x60;multichain&#x60;, &#x60;cbridge&#x60;, &#x60;celercircle&#x60;, &#x60;connext&#x60;, &#x60;amarok&#x60;, &#x60;celerim&#x60;, &#x60;hyphen&#x60;, &#x60;optimism&#x60;, &#x60;polygon&#x60;, &#x60;arbitrum&#x60;, &#x60;avalanche&#x60;, &#x60;across&#x60;, &#x60;stargate&#x60;, &#x60;gnosis&#x60; and &#x60;omni&#x60;.
     */
    public async advancedPossibilitiesPost(xLifiApiKey?: string, possiblitiesRequest?: PossiblitiesRequest, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;



        // Path Params
        const localVarPath = '/advanced/possibilities';

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
            ObjectSerializer.serialize(possiblitiesRequest, "PossiblitiesRequest", ""),
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
     * In order to execute any transfer, you must first request possible `Routes`. From the result set a `Route` can be selected and executed by retrieving the transaction for every included `Step` using the `/steps/transaction` endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Get a set of routes for a request that describes a transfer of tokens
     * @param routesRequest The request object describes a desired any-to-any transfer and contains all information necessary to calculate the most efficient routes.
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async advancedRoutesPost(routesRequest: RoutesRequest, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'routesRequest' is not null or undefined
        if (routesRequest === null || routesRequest === undefined) {
            throw new RequiredError("AdvancedApi", "advancedRoutesPost", "routesRequest");
        }



        // Path Params
        const localVarPath = '/advanced/routes';

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
            ObjectSerializer.serialize(routesRequest, "RoutesRequest", ""),
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
     * This endpoint expects a full `Step` object which usually is retrieved by calling the `/routes` endpoint and selecting the most suitable `Route`. Afterwards the transaction for every required `Step` can be retrieved using this endpoint. **Attention**: This request is more complex and intended to be used via our [JavaScript SDK](https://docs.li.fi/integrate-li.fi-js-sdk/install-li.fi-sdk).
     * Populate a step with transaction data
     * @param step The step object
     * @param xLifiApiKey Authentication header, contact support if you want to get registered.
     */
    public async advancedStepTransactionPost(step: Step, xLifiApiKey?: string, _options?: Configuration): Promise<RequestContext> {
        let _config = _options || this.configuration;

        // verify required parameter 'step' is not null or undefined
        if (step === null || step === undefined) {
            throw new RequiredError("AdvancedApi", "advancedStepTransactionPost", "step");
        }



        // Path Params
        const localVarPath = '/advanced/stepTransaction';

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
            ObjectSerializer.serialize(step, "Step", ""),
            contentType
        );
        requestContext.setBody(serializedBody);


        const defaultAuth: SecurityAuthentication | undefined = _options?.authMethods?.default || this.configuration?.authMethods?.default
        if (defaultAuth?.applySecurityAuthentication) {
            await defaultAuth?.applySecurityAuthentication(requestContext);
        }

        return requestContext;
    }

}

export class AdvancedApiResponseProcessor {

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to advancedPossibilitiesPost
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async advancedPossibilitiesPostWithHttpInfo(response: ResponseContext): Promise<HttpInfo<PossibilitiesResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: PossibilitiesResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "PossibilitiesResponse", ""
            ) as PossibilitiesResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: PossibilitiesResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "PossibilitiesResponse", ""
            ) as PossibilitiesResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to advancedRoutesPost
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async advancedRoutesPostWithHttpInfo(response: ResponseContext): Promise<HttpInfo<RoutesResponse>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: RoutesResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "RoutesResponse", ""
            ) as RoutesResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Invalid Routes Request", undefined, response.headers);
        }
        if (isCodeInRange("404", response.httpStatusCode)) {
            throw new ApiException<undefined>(response.httpStatusCode, "Requested &#x60;to&#x60; or &#x60;from&#x60; token was not found", undefined, response.headers);
        }

        // Work around for missing responses in specification, e.g. for petstore.yaml
        if (response.httpStatusCode >= 200 && response.httpStatusCode <= 299) {
            const body: RoutesResponse = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "RoutesResponse", ""
            ) as RoutesResponse;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }

        throw new ApiException<string | Blob | undefined>(response.httpStatusCode, "Unknown API Status Code!", await response.getBodyAsAny(), response.headers);
    }

    /**
     * Unwraps the actual response sent by the server from the response context and deserializes the response content
     * to the expected objects
     *
     * @params response Response returned by the server for a request to advancedStepTransactionPost
     * @throws ApiException if the response code was not in [200, 299]
     */
    public async advancedStepTransactionPostWithHttpInfo(response: ResponseContext): Promise<HttpInfo<Step>> {
        const contentType = ObjectSerializer.normalizeMediaType(response.headers["content-type"]);
        if (isCodeInRange("200", response.httpStatusCode)) {
            const body: Step = ObjectSerializer.deserialize(
                ObjectSerializer.parse(await response.body.text(), contentType),
                "Step", ""
            ) as Step;
            return new HttpInfo(response.httpStatusCode, response.headers, response.body, body);
        }
        if (isCodeInRange("400", response.httpStatusCode)) {
            throw new ApiException<string>(response.httpStatusCode, "Invalid Step Request", await response.body.text(), response.headers);
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

}
