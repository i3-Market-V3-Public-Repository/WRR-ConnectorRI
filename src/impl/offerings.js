const Logger = require("js-logger");
const axios = require("axios");

const {FetchError} = require("./error");

class Offerings {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    /*
    * Generic function to fetch data
    */
    async _fetchData(accessToken, idToken, method, service, page = 0, size = 99, throwError = true){
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
            if(throwError){
                const errorObj = {
                    statusCode: e.response.data.statusCode,
                    statusDescription: e.response.data.statusDescription,
                    errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage): ''
                }
                throw new FetchError(errorObj)
            }
            if(e.response.status === 404) {
                Logger.error(e.response.data.statusDescription)
                return []
            }
        }
    }

    /*
    * Get list of categories
    */
    async getCategories(accessToken, idToken, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/registration/categories-list`, page, size, false)
    }

    /*
    * Get list of providers
    */
    async getProviders(accessToken, idToken, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/providers-list`, page, size, false)
    }

    /*
    * Get list of offerings
    */
    async getOfferings(accessToken, idToken, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/offerings-list`, page, size, false)
    }

    /*
    * Get offering details
    */
    async getOffering(accessToken, idToken, offeringId, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${offeringId}/offeringId`, page, size)
    }

    /*
    * Get list of offerings from a provider
    */
    async getProviderOfferings(accessToken, idToken, providerDid, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${providerDid}/providerId`, page, size, false)
    }

    /*
    * Get list of offerings from a category
    */
    async getCategoryOfferings(accessToken, idToken, category, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${category}`, page, size, false)
    }

    /*
    * Get list of offerings filtered by title or dataset keywords
    */
    async getOfferingsByText(accessToken, idToken, text, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/textSearch/text/${text}`, page, size, false)
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
                const errorObj = {
                    statusCode: e.response.data.statusCode,
                    statusDescription: e.response.data.statusDescription,
                    errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
                }
                throw new FetchError(errorObj)
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
                const errorObj = {
                    statusCode: e.response.data.statusCode,
                    statusDescription: e.response.data.statusDescription,
                    errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
                }
                throw new FetchError(errorObj)
            }
            throw new FetchError(e)
        }
    }

    /*
    * FEDERATED QUERIES
    */
    async getFederatedOffering(accessToken, idToken, offeringId){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-offering/${offeringId}/offeringId`)
    }

    async getFederatedProviderActiveOfferings(accessToken, idToken, provider, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-activeOffering/${provider}/providerId`, page, size, false)
    }

    async getFederatedCategoryActiveOfferings(accessToken, idToken, category, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-activeOffering/${category}`, page, size, false)
    }

    async getFederatedTextActiveOfferings(accessToken, idToken, text, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/federated-Offering/getActiveOfferingByText/${text}/text`, page, size, false)
    }

    async getFederatedActiveOfferings(accessToken, idToken, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/federated-offerings-list/on-active`, page, size, false)
    }

    async getFederatedProviders(accessToken, idToken, page, size){
        return await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/federated-providers-list`, page, size, false)
    }
}

exports.Offerings = Offerings
