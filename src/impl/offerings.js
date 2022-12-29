const Logger = require("js-logger");
const axios = require("axios");
const _ = require("underscore");
const {FetchError} = require("./error");

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
    * Get list of offerings from a provider
    */
    async getProviderOfferings(accessToken, idToken, providerDid, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${providerDid}/providerId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
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
    * Get list of offerings filtered by title or dataset keywords
    */
    async getOfferingsByText(accessToken, idToken, text){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/textSearch/text/${text}`)
        if(_.isEmpty(result)){
            return []
        }
        return result
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
            data : data
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
            data : data
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
    * FEDERATED QUERIES
    */
    async getFederatedOffering(accessToken, idToken, offeringId){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-offering/${offeringId}/offeringId`)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async getFederatedProviderActiveOfferings(accessToken, idToken, provider, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-activeOffering/${provider}/providerId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async getFederatedCategoryActiveOfferings(accessToken, idToken, category, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-activeOffering/${category}`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async getFederatedTextActiveOfferings(accessToken, idToken, text, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-Offering/getActiveOfferingByText/${text}/text`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async getFederatedActiveOfferings(accessToken, idToken, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/federated-offerings-list/on-active`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    async getFederatedProviders(accessToken, idToken, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/federated-providers-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }
}

exports.Offerings = Offerings
