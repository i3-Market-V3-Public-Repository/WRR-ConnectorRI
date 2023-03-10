const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");

class Ratings {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async _fetchRatings(accessToken, idToken, method, service, data=undefined) {
        const url = this.endpoint + service;

        let headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        };

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
            return res.data
        } catch (e) {
            const errorObj = {
                statusCode: e.response.data.statusCode,
                statusDescription: e.response.data.statusDescription,
                errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
            }
            throw new FetchError(errorObj)
        }
    }

    async getAgreementIsRated(agreementID, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/agreements/${agreementID}/isRated`)
    }

    async getAgreementRating(agreementID, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/agreements/${agreementID}/rating`)
    }

    async getConsumerAgreements(consumerPK, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/consumers/${consumerPK}/agreements`)
    }

    async getConsumerRatings(consumerDID, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/consumers/${consumerDID}/ratings`)
    }

    async getProviderAgreements(providerPK, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/providers/${providerPK}/agreements`)
    }

    async getProviderRatings(providerDID, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/providers/${providerDID}/ratings`)
    }

    async getProviderTotalRating(providerDID, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/providers/${providerDID}/totalRating`)
    }

    async getQuestions(accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/questions`)
    }

    async getAllRatings(accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/ratings`)
    }

    async createRating(data, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "POST", `/SdkRefImpl/api/sdk-ri/rating/api/ratings`, data)
    }

    async getRating(id, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/rating/api/ratings/${id}`)
    }

    async editRating(id, accessToken, idToken, data){
        return this._fetchRatings(accessToken, idToken, "PUT", `/SdkRefImpl/api/sdk-ri/rating/api/ratings/${id}`, data)
    }

    async respondToRating(id, accessToken, idToken, data){
        return this._fetchRatings(accessToken, idToken, "POST", `/SdkRefImpl/api/sdk-ri/rating/api/ratings/${id}/respond`, data)
    }

    async deleteRating(id, accessToken, idToken){
        return this._fetchRatings(accessToken, idToken, "DELETE", `/SdkRefImpl/api/sdk-ri/rating/api/ratings/${id}`)
    }

}
exports.Ratings = Ratings
