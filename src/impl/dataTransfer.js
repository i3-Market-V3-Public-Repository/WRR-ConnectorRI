const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");
const _ = require("underscore");

class DataTransfer {

    /*
    * Generic function to fetch data
    */
    async _fetchData(accessToken, idToken, dataAccessEndpoint, method, path, bodyRequest){
        const url = dataAccessEndpoint + path

        const headers = {
            'accept': 'application/json',
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
            if(e.response.status === 404) {
                Logger.error(e.response.data.statusDescription)
                return []
            }
            if(e.response.status === 401) {
                const error = {
                    statusCode: e.response.data.statusCode,
                    message: e.response.data.statusDescription
                }
                throw new FetchError(error)
            }
            throw new FetchError(e)
        }
    }

    async publishDataSharing(accessToken, idToken, dataAccessEndpoint, bodyRequest){
        const result = await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/dataSharingAgreementInfo`, bodyRequest)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async payMarketFee(accessToken, idToken, dataAccessEndpoint, agreementId, bodyRequest){
        const result = await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/agreement/payMarketFee/${agreementId}`, bodyRequest)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async downloadBatchData(accessToken, idToken, dataAccessEndpoint, agreementId, data, bodyRequest){
        const result = await this._fetchData(accessToken, idToken, dataAccessEndpoint, "POST", `/batch/${data}/${agreementId}`, bodyRequest)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

}

exports.DataTransfer = DataTransfer
