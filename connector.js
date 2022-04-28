const axios = require('axios')
const FetchError = require('./error')
const _ = require('underscore')
const Logger = require("js-logger");
require('url-search-params-polyfill')
const percentEncode = require( '@stdlib/string-percent-encode' );

class Connector {
    constructor(endpoint, logLevel = Logger.OFF) {
        this.endpoint = endpoint
        Logger.useDefaults()
        Logger.setLevel(logLevel)
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
            if(e.response.status === 404){
                const error = {
                    statusCode: e.response.data.statusCode,
                    statusDescription: e.response.data.statusDescription,
                    errorMessage: JSON.parse(e.response.data.errorMessage).error
                }
                Logger.error(error.errorMessage.responseBody.message)
                return []
            }
            else{
                throw new FetchError(e)
            }

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
    async getProviderOfferings(accessToken, idToken, providerId, page, size){
        const result = await this._fetchData(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/offering/${providerId}/providerId`, page, size)
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
        return result
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
            throw new FetchError(e)
        }
    }

    async _getTokenForRegisterClient(oidc_url){
        const base64Credentials = Buffer.from("test@i3-market.eu:i3market").toString('base64');

        const config = {
            method: 'get',
            url: `${oidc_url}/release2/developers/login`,
            headers: {
                'Authorization': `Basic ${base64Credentials}`
            }
        };

        Logger.debug("\nFetch URL: " + config.url)

        try {
            const res = await axios(config)
            return res.data.initialAccessToken
        } catch (e){
            throw new FetchError(e)
        }
    }

    async registerNewClient(oidc_url, clientName, redirectUrl){
        const token = await this._getTokenForRegisterClient(oidc_url)
        const client = {
            "grant_types": [ "authorization_code" ],
            "token_endpoint_auth_method": "client_secret_jwt",
            "redirect_uris": [ redirectUrl ],
            "client_name": clientName,
            "id_token_signed_response_alg": "EdDSA"
        }

        const config = {
            method: 'post',
            url: `${oidc_url}/release2/oidc/reg`,
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data : JSON.stringify(client)
        };

        Logger.debug("\nFetch URL: " + config.url)

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
            throw new FetchError(e)
        }
    }

     getIssueCredentialUrl(oidc_url, credential, callbackUrl){
        const encodedCredential = percentEncode(JSON.stringify(credential))
        const encodedCallbackUrl = percentEncode(callbackUrl)
        return `${oidc_url}/release2/vc/credential/issue/${encodedCredential}/callbackUrl/${encodedCallbackUrl}`;
    }
}

exports.Connector = Connector
