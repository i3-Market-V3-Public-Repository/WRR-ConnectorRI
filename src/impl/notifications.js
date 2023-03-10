const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");

class Notifications {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async _fetchNotification(accessToken, idToken, method, service, throwError = true){
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
            if(throwError){
                const errorObj = {
                    statusCode: e.response.data.statusCode,
                    statusDescription: e.response.data.statusDescription,
                    errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
                }
                throw new FetchError(errorObj)
            }
            if(e.response.status === 404) {
                Logger.error(e.response.data.statusDescription)
                return []
            }
        }
    }

    async getAllNotifications(accessToken, idToken){
        return await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification`, false);
    }

    async getUserNotifications(accessToken, idToken, user){
        const userNotifications = await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification/user/${user}`, false);

        return userNotifications.sort(function (a,b){
            const convertedA = a.dateCreated.replaceAll('/', '-')
            const convertedB = b.dateCreated.replaceAll('/', '-')
            const dateA = new Date(convertedA)
            const dateB = new Date(convertedB)
            return dateB - dateA;
        })
    }

    async getUserUnreadNotifications(accessToken, idToken, user){
        return await this._fetchNotification(accessToken, idToken, "GET", `/SdkRefImpl/api/sdk-ri/notification/user/${user}/unread`, false);
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
            const errorObj = {
                statusCode: e.response.data.statusCode,
                statusDescription: e.response.data.statusDescription,
                errorMessage: e.response.data.errorMessage ? JSON.parse(e.response.data.errorMessage) : ''
            }
            throw new FetchError(errorObj)
        }
    }
}

exports.Notifications = Notifications
