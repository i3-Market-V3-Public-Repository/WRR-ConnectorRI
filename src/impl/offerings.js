const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");
const _ = require("underscore");

class Offerings {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }


    /*
    * Generic function to fetch data
    */
    async _fetchData(accessToken, idToken, method, service, page = undefined, size = undefined){
        const url = this.endpoint + service

        const headers = {
            'accept': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const params = {
            page: page,
            size: size
        }

        const config = {
            url: url,
            method: method,
            headers: headers,
            redirect: 'follow',
            params: params
        }

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

    /*
    * Get offering template
    */
    async getOfferingTemplate(accessToken, idToken){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/template`)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of categories
    */
    async getCategories(accessToken, idToken, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/registration/categories-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of providers
    */
    async getProviders(accessToken, idToken, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/providers-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings
    */
    async getOfferings(accessToken, idToken, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/offerings-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get offering details
    */
    async getOffering(accessToken, idToken, offeringId, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${offeringId}/offeringId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings with contracts count
    */
    async _getOfferingsWithContracts(accessToken, idToken, offerings){
        let result = [];
        for(let i = 0; i < offerings.length; i++) {
            const offering = offerings[i];
            const contracts = await this.getAgreementsByOffering(accessToken, idToken, offering.dataOfferingId);
            result.push({...offering, contracts: contracts.length});
        }
        return result;
    }

    /*
    * Get list of offerings from a provider
    */
    async getProviderOfferings(accessToken, idToken, providerDid, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${providerDid}/providerId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return await this._getOfferingsWithContracts(accessToken, idToken, result);
    }

    /*
    * Get list of offerings from a category
    */
    async getCategoryOfferings(accessToken, idToken, category, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${category}`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result;
    }

    /*
    * Get list of offerings by category
    */
    async getOfferingsByCategory(accessToken, idToken, page, size){
        const categories = await this.getCategories(accessToken, idToken, page, size)

        if(categories){
            let result = []
            for(let i = 0; i < categories.length; i++){
                const category = categories[i].name
                const offerings = await this.getCategoryOfferings(accessToken, idToken, category, page, size)
                if(offerings){
                    const offeringsCount = (offerings.length > 0 ? offerings.length : 0)
                    const res = {
                        "category": category,
                        "offerings": offeringsCount
                    }
                    result.push(res)
                }
            }
            return result
        }
        return []
    }

    /*
    * Register an offering
    */

    async registerOffering(accessToken, idToken, data){
        const url = this.endpoint + "/SdkRefImpl/api/sdk-ri/registration/data-offering"

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const config = {
            method: 'POST',
            url: url,
            headers: headers,
            data : JSON.stringify(data)
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data.dataOfferingId
            }
        } catch (e){
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

    /*
    * Delete an offering
    */
    async deleteOffering(accessToken, idToken, offeringId){
        const url = this.endpoint + `/SdkRefImpl/api/sdk-ri/delete-offering/${offeringId}`

        const headers = {
            'accept': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const config = {
            method: 'DELETE',
            headers: headers,
            url: url
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
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

    /*
    * Update an offering
    */
    async updateOffering(accessToken, idToken, data){
        const url = this.endpoint + "/SdkRefImpl/api/sdk-ri/update-offering"

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const config = {
            method: 'PATCH',
            url: url,
            headers: headers,
            data : JSON.stringify(data)
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
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
}

exports.Offerings  = Offerings
