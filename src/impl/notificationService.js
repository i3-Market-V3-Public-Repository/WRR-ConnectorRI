const Logger = require("js-logger");
const axios = require("axios");
const FetchError = require("./error");

class NotificationService{
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async _fetchNotificationService(accessToken, idToken, method, service, data){
        const url = this.endpoint + service;

        const headers = {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'access_token': accessToken,
            'id_token': idToken
        }

        const config = {
            method: method,
            url: url,
            headers: headers
        }

        if(data)
            config.data = JSON.stringify(data)

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
            throw new FetchError(e)
        }
    }

    async _existsNotificationService(accessToken, idToken, marketId, endpoint){
        const services = await this._fetchNotificationService(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/services/`);
        return services.find(el => el.marketId === marketId && el.endpoint === endpoint);
    }

    async _existsNotificationServiceQueue(accessToken, idToken, serviceId, name){
        const services = await this._fetchNotificationService(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/services/${serviceId}/queues`);
        return services.find(el => el.name === name);
    }

    async createNotificationService(accessToken, idToken, marketId, name, endpoint){
        const service = await this._existsNotificationService(accessToken, idToken, marketId, endpoint)
        if(service){
            return {
                service, error: `Notification Service with marketId "${marketId}" and endpoint "${endpoint}" already exists!`,
            }
        }
        return await this._fetchNotificationService(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/services/`, {endpoint, name, marketId});
    }

    async getNotificationService(accessToken, idToken, serviceId){
        return await this._fetchNotificationService(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/services/${serviceId}`);
    }

    async deleteNotificationService(accessToken, idToken, serviceId){
        return await this._fetchNotificationService(accessToken, idToken, 'DELETE', `/SdkRefImpl/api/sdk-ri/services/${serviceId}`);
    }

    async createNotificationServiceQueue(accessToken, idToken, serviceId, name){
        const queue = await this._existsNotificationServiceQueue(accessToken, idToken, serviceId, name)
        if(queue){
            return {
                queue, error: `Queue "${name}" for Notification Service "${serviceId}" already exists!`
            }
        }
        return await this._fetchNotificationService(accessToken, idToken, 'POST', `/SdkRefImpl/api/sdk-ri/services/${serviceId}/queues`, {name})
    }

    async deleteNotificationServiceQueue(accessToken, idToken, serviceId, queueId){
        return await this._fetchNotificationService(accessToken, idToken, 'DELETE', `/SdkRefImpl/api/sdk-ri/services/${serviceId}/queues/${queueId}`)
    }

    async getNotificationServiceQueue(accessToken, idToken, serviceId, queueId){
        return await this._fetchNotificationService(accessToken, idToken, 'GET', `/SdkRefImpl/api/sdk-ri/services/${serviceId}/queues/${queueId}`)
    }
}

exports.NotificationService = NotificationService
