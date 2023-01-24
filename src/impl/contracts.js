const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");

class Contracts {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async _fetchContract(accessToken, idToken, method, service, data = undefined, authorization = undefined){
        const url = this.endpoint + service;

        let headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        };
        if(authorization)
            headers['Authorization'] = authorization;

        let config = {
            method: method,
            url: url,
            headers: headers
        };
        if(data)
            config.data = JSON.stringify(data)

        Logger.debug("\nFetch URL: " + url);

        try {
            const res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data
            }
        } catch (e){
            throw new FetchError(e)
        }
    }

    async getContractTemplate(accessToken, idToken, offeringId){
        return await this._fetchContract(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/contract/get-contract-template/${offeringId}`);
    }

    async createDataPurchase(accessToken, idToken, originMarketId, consumerDid, authorization, data){
        return await this._fetchContract(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/contract/create-data-purchase?origin_market_id=${originMarketId}&consumer_did=${consumerDid}`, data, authorization)
    }

    async createAgreementRawTransaction(accessToken, idToken, senderAddress, data){
        return await this._fetchContract(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/contract/create_agreement_raw_transaction/${senderAddress}`, data);
    }

    async deploySignedTransaction(accessToken, idToken, data){
        return await this._fetchContract(accessToken, idToken, 'POST',`/SdkRefImpl/api/sdk-ri/contract/deploy_signed_transaction`, data);
    }

    async getAgreementState(accessToken, idToken, agreementId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/state/${agreementId}`);
    }

    async getAgreement(accessToken, idToken, agreementId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/get_agreement/${agreementId}`);
    }

    async getAgreementsByConsumer(accessToken, idToken, publicKeys, active){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/check_agreements_by_consumer/${publicKeys}/${active}`);
    }

    async getAgreementsByOffering(accessToken, idToken, offeringId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/check_agreements_by_data_offering/${offeringId}`);
    }
}

exports.Contracts = Contracts
