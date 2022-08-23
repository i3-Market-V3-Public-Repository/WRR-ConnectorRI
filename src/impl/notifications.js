const Logger = require("js-logger");
const axios = require("axios");
const {FetchError} = require("./error");

class Notifications {

    constructor(endpoint) {
        this.endpoint = endpoint;
    }

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
}

exports.Notifications = Notifications
