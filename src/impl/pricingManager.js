const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");

class PricingManager {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async _fetchPrice(accessToken, idToken, method, service) {
        const url = this.endpoint + service;

        let headers = {
            'accept': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        };

        let config = {
            method: method,
            url: url,
            headers: headers
        };

        Logger.debug("\nFetch URL: " + url);

        try {
            const res = await axios(config)
            return res.data
        } catch (e) {
            throw new FetchError(e)
        }
    }

    async getFee(accessToken, idToken, price) {
        return this._fetchPrice(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/pricingManager/cost/getfee?price=${price}`);
    }

    async getPrice(accessToken, idToken, parameters) {
        return this._fetchPrice(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/pricingManager/price/getprice?parameters=${parameters}`);
    }
}

exports.PricingManager = PricingManager
