const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");
const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default;

class DataTransfer {

    /*
    * Generic function to fetch data
    */
    async _fetchData(accessToken, idToken, dataAccessEndpoint, method, path, bodyRequest){
        const url = dataAccessEndpoint + path

        const headers = {
            'accept': 'application/json',
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        }

        const config = {
            url: url,
            method: method,
            headers: headers
        }

        if(bodyRequest)
            config.data = JSON.stringify(bodyRequest)

        Logger.debug("\nFetch URL: " + url)

        let res
        try {
            res = await axios(config)
            return res.data;
        } catch (e){
            const errorObj = {
                statusCode: e.response.status,
                statusDescription: e.response.statusText
            }
            throw new FetchError(errorObj)
        }
    }

    async registerConnector(accessToken, idToken, dataAccessEndpoint, bodyRequest){
        const digestAuth = new AxiosDigestAuth({
            username: "admin", password: "admin"
        });

        const response = await digestAuth.request({
            headers: {
                'Accept': "application/json",
                'Content-Type': 'application/json'
            },
            method: "POST",
            url: `${dataAccessEndpoint}/regds`,
            data: JSON.stringify(bodyRequest)
        });

        return response.data;
    }

    async publishDataSharing(accessToken, idToken, dataAccessEndpoint, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/dataSharingAgreementInfo`, bodyRequest)
    }

    async getDataExchangeAgreement(accessToken, idToken, dataAccessEndpoint, agreementId){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "GET", `/agreement/getDataExchangeAgreement/${agreementId}`)
    }

    async payMarketFee(accessToken, idToken, dataAccessEndpoint, agreementId, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/payMarketFee/${agreementId}`, bodyRequest)
    }

    async deployRawPaymentTransaction(accessToken, idToken, dataAccessEndpoint, agreementId, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/deployRawPaymentTransaction/${agreementId}`, bodyRequest)
    }

    async getListDataSourceFiles(accessToken, idToken, dataAccessEndpoint, offeringId){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "GET", `/batch/listDataSourceFiles/${offeringId}`)
    }

    async downloadBatchData(accessToken, idToken, dataAccessEndpoint, agreementId, data, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/batch/${data}/${agreementId}`, bodyRequest)
    }

    async requestPop(accessToken, idToken, dataAccessEndpoint, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/batch/pop/`, bodyRequest)
    }

}

exports.DataTransfer = DataTransfer
