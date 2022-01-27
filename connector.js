const axios = require('axios')
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

    /*
    * Get an access token from keycloak
    */
    async _getAccessToken(){

        const url = "http://83.149.125.78:8080/auth/realms/i3market/protocol/openid-connect/token"

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        const params = new URLSearchParams({
            "grant_type": "password",
            "client_id": "SDK-RI_Client",
            "client_secret": "703e0db9-a646-4f1d-bdc6-2b3fe20db08a",
            "scope": "openid",
            "username": this.username,
            "password": this.password,
        })

        const config = {
            method: 'POST',
            url: url,
            headers: headers,
            data : params
        }

        try{
            const res = await axios(config)
            return res.data.access_token
        } catch(e){
            console.error(e)
            throw e
        }
    }

    /*
    * Generic function to fetch data
    */
    async _fetchData(method, service, page = undefined, size = undefined){

        const url = this.endpoint + service

        const headers = {
            "Authorization": "Bearer " + await this.accessToken
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

        console.log("\nFetch URL: " + url)

        let res
        try {
            res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data
            }
        } catch (e){
            if(e.response.status === 401){
                console.log("\nToken has expired. Generate a new access token.")
                this.accessToken = this._getAccessToken()
                return await this._fetchData(method, service, page, size)
            }
            else{
                throw new FetchError(e)
            }
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
    * Register an offering
    */
    async registerOffering(data){

        const url = this.endpoint + "/SdkRefImpl/api/sdk-ri/registration/data-offering"

        const headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + await this.accessToken
        }

        const config = {
            method: 'POST',
            url: url,
            headers: headers,
            data : JSON.stringify(data)
        }

        console.log("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data.map(el=>el.dataOfferingId)
            }
        } catch (e){
            throw new FetchError(e)
        }
    }

    /*
    * Delete an offering
    */
    async deleteOffering(offeringId){
        const headers = {
            "Authorization": "Bearer " + await this.accessToken
        }

        const url = this.endpoint + `/SdkRefImpl/api/sdk-ri/delete-offering/${offeringId}`

        const config = {
            method: 'DELETE',
            headers: headers,
            url: url
        }

        console.log("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
            throw new FetchError(e)
        }
    }
}
