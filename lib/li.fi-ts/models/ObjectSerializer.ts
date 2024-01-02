export * from './Action';
export * from './AllowDenyPrefer';
export * from './BasicTransaction';
export * from './Bridge';
export * from './BridgeDefinition';
export * from './BridgesEnum';
export * from './Chain';
export * from './ChainMetamask';
export * from './ChainMetamaskNativeCurrency';
export * from './ChainsResponse';
export * from './Connection';
export * from './ConnectionsResponse';
export * from './ContractCall';
export * from './ContractCallRequest';
export * from './ContractCallsRequest';
export * from './Estimate';
export * from './EstimateData';
export * from './Exchange';
export * from './ExchangeDefinition';
export * from './ExchangesEnum';
export * from './FeeBalances';
export * from './FeeCost';
export * from './GasCost';
export * from './GasPrice';
export * from './GasSuggestion';
export * from './IntegratorResponse';
export * from './IntegratorWithdrawalResponse';
export * from './IntegratorWithdrawalResponseTransactionRequest';
export * from './LIFuelStatus';
export * from './LIFuelStatusStateEnum';
export * from './PossibilitiesResponse';
export * from './PossibilitiesTopicEnum';
export * from './PossiblitiesRequest';
export * from './QuoteBridgesEnum';
export * from './QuoteExchangesEnum';
export * from './QuoteGet404Response';
export * from './Route';
export * from './RouteOptions';
export * from './RoutesRequest';
export * from './RoutesResponse';
export * from './StatusResponse';
export * from './Step';
export * from './StepRequest';
export * from './StepRequestAction';
export * from './StepRequestActionFromToken';
export * from './StepRequestEstimate';
export * from './StepRequestEstimateData';
export * from './StepRequestEstimateDataBid';
export * from './StepRequestEstimateFeeCostsInner';
export * from './StepRequestEstimateGasCostsInner';
export * from './StepRequestEstimateGasCostsInnerToken';
export * from './StepRequestExecution';
export * from './StepRequestExecutionProcessInner';
export * from './SupportedChains';
export * from './Token';
export * from './TokenBalances';
export * from './TokenRequest';
export * from './TokensGet200Response';
export * from './ToolError';
export * from './Tools';
export * from './TransactionInfo';
export * from './TxInfo';
export * from './UnavailableRoutes';
export * from './UnavailableRoutesFailedInner';
export * from './UnavailableRoutesFilteredOutInner';
export * from './WalletAnalyticsResponse';

import { Action } from './Action';
import { AllowDenyPrefer } from './AllowDenyPrefer';
import { BasicTransaction } from './BasicTransaction';
import { Bridge } from './Bridge';
import { BridgeDefinition } from './BridgeDefinition';
import { BridgesEnum } from './BridgesEnum';
import { Chain } from './Chain';
import { ChainMetamask } from './ChainMetamask';
import { ChainMetamaskNativeCurrency } from './ChainMetamaskNativeCurrency';
import { ChainsResponse } from './ChainsResponse';
import { Connection } from './Connection';
import { ConnectionsResponse } from './ConnectionsResponse';
import { ContractCall } from './ContractCall';
import { ContractCallRequest } from './ContractCallRequest';
import { ContractCallsRequest } from './ContractCallsRequest';
import { Estimate } from './Estimate';
import { EstimateData } from './EstimateData';
import { Exchange } from './Exchange';
import { ExchangeDefinition, ExchangeDefinitionToolEnum } from './ExchangeDefinition';
import { ExchangesEnum } from './ExchangesEnum';
import { FeeBalances } from './FeeBalances';
import { FeeCost } from './FeeCost';
import { GasCost } from './GasCost';
import { GasPrice } from './GasPrice';
import { GasSuggestionDetails, GasSuggestionResponse } from './GasSuggestion';
import { IntegratorResponse } from './IntegratorResponse';
import { IntegratorWithdrawalResponse } from './IntegratorWithdrawalResponse';
import { IntegratorWithdrawalResponseTransactionRequest } from './IntegratorWithdrawalResponseTransactionRequest';
import { LIFuelStatus } from './LIFuelStatus';
import { LIFuelStatusStateEnum } from './LIFuelStatusStateEnum';
import { PossibilitiesResponse } from './PossibilitiesResponse';
import { PossibilitiesTopicEnum } from './PossibilitiesTopicEnum';
import { PossiblitiesRequest } from './PossiblitiesRequest';
import { QuoteBridgesEnum } from './QuoteBridgesEnum';
import { QuoteExchangesEnum } from './QuoteExchangesEnum';
import { QuoteGet404Response } from './QuoteGet404Response';
import { Route } from './Route';
import { RouteOptions, RouteOptionsOrderEnum } from './RouteOptions';
import { RoutesRequest } from './RoutesRequest';
import { RoutesResponse } from './RoutesResponse';
import { StatusResponse, StatusResponseStatusEnum, StatusResponseSubstatusEnum } from './StatusResponse';
import { Step, StepTypeEnum } from './Step';
import { StepRequest } from './StepRequest';
import { StepRequestAction } from './StepRequestAction';
import { StepRequestActionFromToken } from './StepRequestActionFromToken';
import { StepRequestEstimate } from './StepRequestEstimate';
import { StepRequestEstimateData } from './StepRequestEstimateData';
import { StepRequestEstimateDataBid } from './StepRequestEstimateDataBid';
import { StepRequestEstimateFeeCostsInner } from './StepRequestEstimateFeeCostsInner';
import { StepRequestEstimateGasCostsInner } from './StepRequestEstimateGasCostsInner';
import { StepRequestEstimateGasCostsInnerToken } from './StepRequestEstimateGasCostsInnerToken';
import { StepRequestExecution } from './StepRequestExecution';
import { StepRequestExecutionProcessInner } from './StepRequestExecutionProcessInner';
import { SupportedChains } from './SupportedChains';
import { Token } from './Token';
import { TokenBalances } from './TokenBalances';
import { TokenRequest } from './TokenRequest';
import { TokensGet200Response } from './TokensGet200Response';
import { ToolError, ToolErrorErrorTypeEnum, ToolErrorCodeEnum } from './ToolError';
import { Tools } from './Tools';
import { TransactionInfo } from './TransactionInfo';
import { TxInfo } from './TxInfo';
import { UnavailableRoutes } from './UnavailableRoutes';
import { UnavailableRoutesFailedInner } from './UnavailableRoutesFailedInner';
import { UnavailableRoutesFilteredOutInner } from './UnavailableRoutesFilteredOutInner';
import { WalletAnalyticsResponse } from './WalletAnalyticsResponse';

/* tslint:disable:no-unused-variable */
let primitives = [
    "string",
    "boolean",
    "double",
    "integer",
    "long",
    "float",
    "number",
    "any"
];

const supportedMediaTypes: { [mediaType: string]: number } = {
    "application/json": Infinity,
    "application/json-patch+json": 1,
    "application/merge-patch+json": 1,
    "application/strategic-merge-patch+json": 1,
    "application/octet-stream": 0,
    "application/x-www-form-urlencoded": 0
}


let enumsMap: Set<string> = new Set<string>([
    "BridgesEnum",
    "ExchangeDefinitionToolEnum",
    "ExchangesEnum",
    "LIFuelStatusStateEnum",
    "PossibilitiesTopicEnum",
    "QuoteBridgesEnum",
    "QuoteExchangesEnum",
    "RouteOptionsOrderEnum",
    "StatusResponseStatusEnum",
    "StatusResponseSubstatusEnum",
    "StepTypeEnum",
    "ToolErrorErrorTypeEnum",
    "ToolErrorCodeEnum",
]);

let typeMap: { [index: string]: any } = {
    "Action": Action,
    "AllowDenyPrefer": AllowDenyPrefer,
    "BasicTransaction": BasicTransaction,
    "Bridge": Bridge,
    "BridgeDefinition": BridgeDefinition,
    "Chain": Chain,
    "ChainMetamask": ChainMetamask,
    "ChainMetamaskNativeCurrency": ChainMetamaskNativeCurrency,
    "ChainsResponse": ChainsResponse,
    "Connection": Connection,
    "ConnectionsResponse": ConnectionsResponse,
    "ContractCall": ContractCall,
    "ContractCallRequest": ContractCallRequest,
    "ContractCallsRequest": ContractCallsRequest,
    "Estimate": Estimate,
    "EstimateData": EstimateData,
    "Exchange": Exchange,
    "ExchangeDefinition": ExchangeDefinition,
    "FeeBalances": FeeBalances,
    "FeeCost": FeeCost,
    "GasCost": GasCost,
    "GasPrice": GasPrice,
    "GasSuggestionDetails": GasSuggestionDetails,
    "GasSuggestionResponse": GasSuggestionResponse,
    "IntegratorResponse": IntegratorResponse,
    "IntegratorWithdrawalResponse": IntegratorWithdrawalResponse,
    "IntegratorWithdrawalResponseTransactionRequest": IntegratorWithdrawalResponseTransactionRequest,
    "LIFuelStatus": LIFuelStatus,
    "PossibilitiesResponse": PossibilitiesResponse,
    "PossiblitiesRequest": PossiblitiesRequest,
    "QuoteGet404Response": QuoteGet404Response,
    "Route": Route,
    "RouteOptions": RouteOptions,
    "RoutesRequest": RoutesRequest,
    "RoutesResponse": RoutesResponse,
    "StatusResponse": StatusResponse,
    "Step": Step,
    "StepRequest": StepRequest,
    "StepRequestAction": StepRequestAction,
    "StepRequestActionFromToken": StepRequestActionFromToken,
    "StepRequestEstimate": StepRequestEstimate,
    "StepRequestEstimateData": StepRequestEstimateData,
    "StepRequestEstimateDataBid": StepRequestEstimateDataBid,
    "StepRequestEstimateFeeCostsInner": StepRequestEstimateFeeCostsInner,
    "StepRequestEstimateGasCostsInner": StepRequestEstimateGasCostsInner,
    "StepRequestEstimateGasCostsInnerToken": StepRequestEstimateGasCostsInnerToken,
    "StepRequestExecution": StepRequestExecution,
    "StepRequestExecutionProcessInner": StepRequestExecutionProcessInner,
    "SupportedChains": SupportedChains,
    "Token": Token,
    "TokenBalances": TokenBalances,
    "TokenRequest": TokenRequest,
    "TokensGet200Response": TokensGet200Response,
    "ToolError": ToolError,
    "Tools": Tools,
    "TransactionInfo": TransactionInfo,
    "TxInfo": TxInfo,
    "UnavailableRoutes": UnavailableRoutes,
    "UnavailableRoutesFailedInner": UnavailableRoutesFailedInner,
    "UnavailableRoutesFilteredOutInner": UnavailableRoutesFilteredOutInner,
    "WalletAnalyticsResponse": WalletAnalyticsResponse,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap.has(expectedType)) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if (typeMap[discriminatorType]) {
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string, format: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let date of data) {
                transformedData.push(ObjectSerializer.serialize(date, subType, format));
            }
            return transformedData;
        } else if (type === "Date") {
            if (format == "date") {
                let month = data.getMonth() + 1
                month = month < 10 ? "0" + month.toString() : month.toString()
                let day = data.getDate();
                day = day < 10 ? "0" + day.toString() : day.toString();

                return data.getFullYear() + "-" + month + "-" + day;
            } else {
                return data.toISOString();
            }
        } else {
            if (enumsMap.has(type)) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: { [index: string]: any } = {};
            for (let attributeType of attributeTypes) {
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type, attributeType.format);
            }
            return Object.assign(data, instance);
        }
    }

    public static deserialize(data: any, type: string, format: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let date of data) {
                transformedData.push(ObjectSerializer.deserialize(date, subType, format));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap.has(type)) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let attributeType of attributeTypes) {
                let value;
                const pathArr = attributeType.baseName.split('.');
                let curData = data;
                for (let i = 0; i < pathArr.length; i++) {
                    const prop = pathArr[i];
                    if (prop === '') continue;
                    if (prop.startsWith('[') && prop.endsWith(']')) {
                        const index = parseInt(prop.substring(1, prop.length - 1), 10);
                        curData = Object.values(curData)[index];
                    } else {
                        curData = curData[prop];
                    }
                }
                value = ObjectSerializer.deserialize(curData, attributeType.type, attributeType.format);

                if (value !== undefined) {
                    instance[attributeType.name] = value;
                }
            }
            return Object.assign(data, instance);
        }
    }


    /**
     * Normalize media type
     *
     * We currently do not handle any media types attributes, i.e. anything
     * after a semicolon. All content is assumed to be UTF-8 compatible.
     */
    public static normalizeMediaType(mediaType: string | undefined): string | undefined {
        if (mediaType === undefined) {
            return undefined;
        }
        return mediaType.split(";")[0].trim().toLowerCase();
    }

    /**
     * From a list of possible media types, choose the one we can handle best.
     *
     * The order of the given media types does not have any impact on the choice
     * made.
     */
    public static getPreferredMediaType(mediaTypes: Array<string>): string {
        /** According to OAS 3 we should default to json */
        if (mediaTypes.length === 0) {
            return "application/json";
        }

        const normalMediaTypes = mediaTypes.map(this.normalizeMediaType);
        let selectedMediaType: string | undefined = undefined;
        let selectedRank: number = -Infinity;
        for (const mediaType of normalMediaTypes) {
            if (supportedMediaTypes[mediaType!] > selectedRank) {
                selectedMediaType = mediaType;
                selectedRank = supportedMediaTypes[mediaType!];
            }
        }

        if (selectedMediaType === undefined) {
            throw new Error("None of the given media types are supported: " + mediaTypes.join(", "));
        }

        return selectedMediaType!;
    }

    /**
     * Convert data to a string according the given media type
     */
    public static stringify(data: any, mediaType: string): string {
        if (mediaType === "text/plain") {
            return String(data);
        }

        if (mediaType === "application/json" || mediaType === "application/json-patch+json" || mediaType === "application/merge-patch+json" || mediaType === "application/strategic-merge-patch+json") {
            return JSON.stringify(data);
        }

        throw new Error("The mediaType " + mediaType + " is not supported by ObjectSerializer.stringify.");
    }

    /**
     * Parse data from a string according to the given media type
     */
    public static parse(rawData: string, mediaType: string | undefined) {
        if (mediaType === undefined) {
            throw new Error("Cannot parse content. No Content-Type defined.");
        }

        if (mediaType === "text/plain") {
            return rawData;
        }

        if (mediaType === "application/json" || mediaType === "application/json-patch+json" || mediaType === "application/merge-patch+json" || mediaType === "application/strategic-merge-patch+json") {
            return JSON.parse(rawData);
        }

        if (mediaType === "text/html") {
            return rawData;
        }

        throw new Error("The mediaType " + mediaType + " is not supported by ObjectSerializer.parse.");
    }
}
