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
    *
    * OFFERINGS MANAGEMENT
    *
    */

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

    /*
    *
    * OIDC / VC
    *
    */

    /*
    * Get a token to register a new OIDC Client
    */
    async _getTokenForRegisterClient(oidc_url){
        const base64Credentials = Buffer.from("test@i3-market.eu:i3market").toString('base64');

        const config = {
            method: 'get',
            url: `${oidc_url}/developers/login`,
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

    /*
    * Register a new OIDC Client
    */
    async registerNewClient(oidc_url, clientName, redirectUrl, logoutRedirectUrl){
        const token = await this._getTokenForRegisterClient(oidc_url)
        const client = {
            "grant_types": [ "authorization_code" ],
            "token_endpoint_auth_method": "client_secret_jwt",
            "redirect_uris": [ redirectUrl ],
            "post_logout_redirect_uris": [ logoutRedirectUrl ],
            "client_name": clientName,
            "id_token_signed_response_alg": "EdDSA"
        }

        const config = {
            method: 'post',
            url: `${oidc_url}/oidc/reg`,
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

    /*
    * Issue a new verifiable credential
    */
    getIssueCredentialUrl(vc_url, credential, callbackUrl){
        const encodedCredential = percentEncode(JSON.stringify(credential))
        const encodedCallbackUrl = percentEncode(callbackUrl)
        return `${vc_url}/credential/issue/${encodedCredential}/callbackUrl/${encodedCallbackUrl}`;
    }

    /*
    *
    * NOTIFICATIONS
    *
    */

    /*
    * Generic function to fetch notification data
    */
    async _fetchNotification(accessToken, idToken, method, service){
        const url = this.endpoint + service;

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        };

        const config = {
            method: method,
            url: url,
            headers: headers
        };

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
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

    async getAllNotifications(accessToken, idToken){
        return await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification`);
    }

    async getUserNotifications(accessToken, idToken, user){
        const userNotifications = await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification/user/${user}`);

        return userNotifications.sort(function (a,b){
            const convertedA = a.dateCreated.replaceAll('/', '-')
            const convertedB = b.dateCreated.replaceAll('/', '-')
            const dateA = new Date(convertedA)
            const dateB = new Date(convertedB)
            return dateB - dateA;
        })
    }

    async getUserUnreadNotifications(accessToken, idToken, user){
        return await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification/user/${user}/unread`);
    }

    async markNotificationsAsRead(accessToken, idToken, notificationId){
        return await this._fetchNotification(accessToken, idToken, "PATCH", `/SdkRefImpl/api/sdk-ri/notification/${notificationId}/read`);
    }

    async markNotificationsAsUnread(accessToken, idToken, notificationId){
        return await this._fetchNotification(accessToken, idToken, "PATCH", `/SdkRefImpl/api/sdk-ri/notification/${notificationId}/unread`);
    }

    async getNotification(accessToken, idToken, notificationId){
        return await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification/${notificationId}`);
    }

    async deleteNotification(accessToken, idToken, notificationId){
        return await this._fetchNotification(accessToken, idToken, "DELETE", `/SdkRefImpl/api/sdk-ri/notification/${notificationId}`);
    }

    async createNotification(accessToken, idToken, origin, receiver_id, type, message, status){
        const url = `${this.endpoint}/SdkRefImpl/api/sdk-ri/notification`;

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const data = {
            "origin": origin,
            "predefined": true,
            "type": type,
            "receiver_id": receiver_id,
            "message": message,
            "status": status
        }

        const config = {
            method: 'post',
            url: url,
            headers: headers,
            data : JSON.stringify(data)
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            const resultData = res.data
            if(resultData.data){
                return resultData.data
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
     *
     * NOTIFICATION SERVICE
     *
     */
    async createNotificationService(marketId, name, endpoint){

        const exists = await this._existsNotificationService(marketId, endpoint)
        if(exists){
            return {
                msg: `Notification service with marketId "${marketId}" and endpoint "${endpoint}" already exists!`
            }
        }

        const backplaneUrl = this.endpoint.substring(0, this.endpoint.length-4) + '3000'
        const url = `${backplaneUrl}/notification-manager-oas/api/v1/services/`

        const data = {
            "endpoint": endpoint,
            "name": name,
            "marketId": marketId
        };

        const config = {
            method: 'post',
            url: url,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
            throw new FetchError(e)
        }

    }

    async getNotificationService(serviceId){
        const backplaneUrl = this.endpoint.substring(0, this.endpoint.length-4) + '3000'
        const url = `${backplaneUrl}/notification-manager-oas/api/v1/services/${serviceId}`

        const config = {
            method: 'get',
            url: url,
            headers: {
                'accept': 'application/json'
            }
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            return res.data
        } catch (e){
            throw new FetchError(e)
        }
    }

    async _existsNotificationService(marketId, endpoint){
        const backplaneUrl = this.endpoint.substring(0, this.endpoint.length-4) + '3000'
        const url = `${backplaneUrl}/notification-manager-oas/api/v1/services/`

        const config = {
            method: 'get',
            url: url,
            headers: {
                'accept': 'application/json'
            }
        }

        Logger.debug("\nFetch URL: " + url)

        try {
            const res = await axios(config)
            const exists = res.data.find(el => el.marketId === marketId && el.endpoint === endpoint)
            return !!exists
        } catch (e){
            throw new FetchError(e)
        }
    }

    /*
    *
    * CONTRACTS
    *
    */
    async _fetchContract(accessToken, idToken, method, service, data = undefined, authorization = undefined){
        const url = this.endpoint + service;

        let headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        };
        if(authorization)
            headers['Authorization'] = authorization;

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
            return res.data;
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

    async getContractTemplate(accessToken, idToken, offeringId){
        return await this._fetchContract(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/contract/get-contract-template/${offeringId}`);
    }

    async createDataPurchase(accessToken, idToken, originMarketId, consumerDid, authorization, data){
        return await this._fetchContract(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/contract/create-data-purchase?origin_market_id=${originMarketId}&consumer_did=${consumerDid}`, data, authorization)
    }

    async createAgreementRawTransaction(accessToken, idToken, senderAddress, data){
        return await this._fetchContract(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/contract/create_agreement_raw_transaction/${senderAddress}`, data);
    }

    async deploySignedTransaction(accessToken, idToken, data){
        return await this._fetchContract(accessToken, idToken, 'POST',`/SdkRefImpl/api/sdk-ri/contract/deploy_signed_transaction`, data);
    }

    async getAgreementState(accessToken, idToken, agreementId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/state/${agreementId}`);
    }

    async getAgreement(accessToken, idToken, agreementId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/get_agreement/${agreementId}`);
    }

    async getAgreementsByConsumer(accessToken, idToken, consumerId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/check_agreements_by_consumer/${consumerId}`);
    }

    async getAgreementsByProvider(accessToken, idToken, providerId){
        return await this._fetchContract(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/contract/check_agreements_by_provider/${providerId}`);
    }

    /*
    *
    * PRICING MANAGER
    *
    */
    async _fetchPrice(accessToken, idToken, method, service){
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
            return res.data;
        } catch (e){
            throw new FetchError(e)
        }
    }

    async getFee(accessToken, idToken, price){
        return this._fetchPrice(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/pricingManager/cost/getfee?price=${price}`);
    }

    async getPrice(accessToken, idToken, parameters){
        return this._fetchPrice(accessToken, idToken, 'GET',`/SdkRefImpl/api/sdk-ri/pricingManager/cost/getprice?parameters=${parameters}`);
    }
}

exports.Connector = Connector
