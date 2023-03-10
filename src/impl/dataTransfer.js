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
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const config = {
            url: url,
            method: method,
            headers: headers,
            redirect: 'follow',
        }

        if(bodyRequest)
            config.data = JSON.stringify(bodyRequest)

        Logger.debug("\nFetch URL: " + url)

        let res
        try {
            res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data
            }
        } catch (e){
            const errorObj = {
                statusCode: e.response.data.statusCode,
                statusDescription: e.response.data.statusDescription,
                errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
            }
            throw new FetchError(errorObj)
        }
    }

    async publishDataSharing(accessToken, idToken, dataAccessEndpoint, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/dataSharingAgreementInfo`, bodyRequest)
    }

    async getDataExchangeAgreement(accessToken, idToken, agreementId){
        return await this._fetchData(accessToken, idToken, "POST", `/agreement/getDataExchangeAgreement/${agreementId}`)
    }

    async registerConnector(dataAccessEndpoint, bodyRequest){

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

    async payMarketFee(accessToken, idToken, dataAccessEndpoint, agreementId, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/payMarketFee/${agreementId}`, bodyRequest)
    }

    async downloadBatchData(accessToken, idToken, dataAccessEndpoint, agreementId, data, bodyRequest){
        return await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/batch/${data}/${agreementId}`, bodyRequest)
    }

}

exports.DataTransfer = DataTransfer
