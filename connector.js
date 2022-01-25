const fetch = require("node-fetch")
const FetchError = require('./error')
const _ = require('underscore')
require('url-search-params-polyfill')

module.exports = class Connector {
    constructor(endpoint, username, password) {
        this.endpoint = endpoint
        this.username = username
        this.password = password
        this.accessToken = this._getAccessToken()
    }

    async _getAccessToken(){

        const url = "http://83.149.125.78:8080/auth/realms/i3market/protocol/openid-connect/token"

        const headers = new fetch.Headers({
            "Content-Type": "application/x-www-form-urlencoded"
        })

        const params = new URLSearchParams({
            "grant_type": "password",
            "client_id": "SDK-RI_Client",
            "client_secret": "703e0db9-a646-4f1d-bdc6-2b3fe20db08a",
            "scope": "openid",
            "username": this.username,
            "password": this.password,
        })

        const options = {
            method: 'POST',
            headers: headers,
            body: params,
            redirect: 'follow'
        }

        try{
            const res = await fetch(url, options)
            const jsonData = await res.json()
            if(jsonData){
                return jsonData.access_token
            }
            return null
        } catch(e){
            console.log(e)
            throw e
        }
    }

    /*
    * Generic function to fetch data
    */
    async _fetchData(method, service, page = undefined, size = undefined){
        const headers = new fetch.Headers({
            "Authorization": "Bearer " + await this.accessToken
        })

        const options = {
            method: method,
            headers: headers,
            redirect: 'follow'
        }

        const endpointUrl = new URL(this.endpoint + service)
        if(page){
            endpointUrl.searchParams.append('page', page)
        }
        if(size){
            endpointUrl.searchParams.append('size', size)
        }

        console.log("\nFetch URL: " + endpointUrl)

        try{
            const res = await fetch(endpointUrl, options)

            if(res.status === 401){
                console.log("\nToken has expired. Generate a new access token.")
                this.accessToken = this._getAccessToken()
                return await this._fetchData(method, service, page, size)
            }
            else if(res.status === 200){
                const jsonData = await res.json()
                if(jsonData.data){
                    return jsonData.data
                }
            }
            return null
        } catch(e){
            console.log(e)
            throw e
        }
    }

    /*
    * Get offering template
    */
    async getOfferingTemplate(){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/template`)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of categories
    */
    async getCategories(page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/registration/categories-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of providers
    */
    async getProviders(page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/providers-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings
    */
    async getOfferings(page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/offerings-list`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get offering details
    */
    async getOffering(offeringId, page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/${offeringId}/offeringId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings from a provider
    */
    async getProviderOfferings(providerId, page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/${providerId}/providerId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings from a category
    */
    async getCategoryOfferings(category, page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/${category}`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result
    }

    /*
    * Get list of offerings by category
    */
    async getOfferingsByCategory(){
        const categories = await this.getCategories()

        if(categories){
            let result = []
            for(let i = 0; i < categories.length; i++){
                const category = categories[i].name
                const offerings = await this.getCategoryOfferings(category)
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
    * Get list of contracts parameters from an offering
    */
    async getOfferingContractParameters(offeringId, page, size){
        const result = await this._fetchData("GET", `/SdkRefImpl/api/sdk-ri/offering/contract-parameter/${offeringId}/offeringId`, page, size)
        if(_.isEmpty(result)){
            return []
        }
        return result.map(el=>el.contractParameters)
    }

    /*
    * Register an offering
    */
    async registerOffering(data){
        const headers = new fetch.Headers({
            "Content-Type": "application/json",
            "Authorization": "Bearer " + await this.accessToken
        })

        const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            redirect: 'follow'
        };

        const url = this.endpoint + "/SdkRefImpl/api/sdk-ri/registration/data-offering"
        console.log("\nFetch URL: " + url)

        try{
            const res = await fetch(url, options)

            if(res.status === 200){
                const jsonData = await res.json()
                if(jsonData.data){
                    return jsonData.data.map(el=>el.dataOfferingId)
                }
            }
            else{
                const jsonRes = await res.json()
                throw new FetchError(jsonRes.error)
            }

        } catch(e){
            console.log(e)
            throw e
        }
    }

    /*
    * Delete an offering
    */
    async deleteOffering(offeringId){
        const headers = new fetch.Headers({
            "Authorization": "Bearer " + await this.accessToken
        })

        const options = {
            method: 'DELETE',
            headers: headers,
            redirect: 'follow'
        };

        const url = this.endpoint + `/SdkRefImpl/api/sdk-ri/delete-offering/${offeringId}`
        console.log("\nFetch URL: " + url)

        try{
            const res = await fetch(url, options)

            if(res.status === 200){
                console.log(`\nData Offering ${offeringId} deleted.`)
            }
            else{
                const jsonRes = await res.json()
                throw new FetchError(jsonRes.error)
            }

        } catch(e){
            console.log(e)
            throw e
        }
    }
}
