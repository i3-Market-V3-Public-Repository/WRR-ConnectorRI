const _ = require('underscore')
const Logger = require("js-logger");
const {PricingManager} = require("./impl/pricingManager");
const {Contracts} = require("./impl/contracts");
const {Notifications} = require("./impl/notifications");
const {NotificationService} = require("./impl/notificationService");
const {Oidc} = require("./impl/oidc");
const {Vc} = require("./impl/vc");
const {Offerings} = require("./impl/offerings");

class Connector {
    constructor(endpoint, logLevel = Logger.OFF) {
        this.endpoint = endpoint
        this.offerings = new Offerings(endpoint)
        this.pricingManager = new PricingManager(endpoint);
        this.contracts = new Contracts(endpoint);
        this.notifications = new Notifications(endpoint);
        this.notificationService = new NotificationService(endpoint);
        this.oidc = new Oidc()
        this.vc = new Vc()

        Logger.useDefaults()
        Logger.setLevel(logLevel)
    }

    /*
    *
    * OFFERINGS
    *
    */
    async getOfferingTemplate(accessToken, idToken){
        return await this.offerings.getOfferingTemplate(accessToken, idToken)
    }

    async getCategories(accessToken, idToken, page, size){
        return await this.offerings.getCategories(accessToken, idToken, page, size)
    }

    async getProviders(accessToken, idToken, page, size){
        return await this.offerings.getProviders(accessToken, idToken, page, size)
    }

    async getOfferings(accessToken, idToken, page, size){
        return await this.offerings.getOfferings(accessToken, idToken, page, size)
    }

    async getOffering(accessToken, idToken, offeringId, page, size){
        return await this.offerings.getOffering(accessToken, idToken, offeringId, page, size)
    }

    async getProviderOfferings(accessToken, idToken, providerId, page, size){
        return await this.offerings.getProviderOfferings(accessToken, idToken, providerDid, page, size)
    }

    async getCategoryOfferings(accessToken, idToken, category, page, size){
        return await this.offerings.getCategoryOfferings(accessToken, idToken, category, page, size)
    }

    async getOfferingsByCategory(accessToken, idToken, page, size){
        return await this.offerings.getOfferingsByCategory(accessToken, idToken, page, size)
    }

    async registerOffering(accessToken, idToken, data){
        return await this.offerings.registerOffering(accessToken, idToken, data)
    }

    async deleteOffering(accessToken, idToken, offeringId){
        return await this.offerings.deleteOffering(accessToken, idToken, offeringId)
    }

    async updateOffering(accessToken, idToken, data){
        return await this.offerings.updateOffering(accessToken, idToken, data)
    }

    /*
    *
    * OIDC
    *
    */
    async registerNewClient(oidc_url, clientName, redirectUrl, logoutRedirectUrl){
        return await this.oidc.registerNewClient(oidc_url, clientName, redirectUrl, logoutRedirectUrl)
    }

    /*
    *
    * VC
    *
    */
    getIssueCredentialUrl(vc_url, credential, callbackUrl){
        return this.vc.getIssueCredentialUrl(vc_url, credential, callbackUrl)
    }

    /*
    *
    * NOTIFICATIONS
    *
    */
    async getAllNotifications(accessToken, idToken){
        return await this.notifications.getAllNotifications(accessToken, idToken);
    }

    async getUserNotifications(accessToken, idToken, user){
        return await this.notifications.getUserNotifications(accessToken, idToken, user);
    }

    async getUserUnreadNotifications(accessToken, idToken, user){
        return await this.notifications.getUserUnreadNotifications(accessToken, idToken, user)
    }

    async markNotificationsAsRead(accessToken, idToken, notificationId){
        return await this.notifications.markNotificationsAsRead(accessToken, idToken, notificationId)
    }

    async markNotificationsAsUnread(accessToken, idToken, notificationId){
        return await this.notifications.markNotificationsAsUnread(accessToken, idToken, notificationId)
    }

    async getNotification(accessToken, idToken, notificationId){
        return await this.notifications.getNotification(accessToken, idToken, notificationId)
    }

    async deleteNotification(accessToken, idToken, notificationId){
        return await this.notifications.deleteNotification(accessToken, idToken, notificationId)
    }

    async createNotification(accessToken, idToken, origin, receiver_id, type, message, status){
        return await this.notifications.createNotification(accessToken, idToken, origin, receiver_id, type, message, status)
    }

    /*
     *
     * NOTIFICATION SERVICE
     *
     */
    async createNotificationService(accessToken, idToken, marketId, name, endpoint){
        return await this.notificationService.createNotificationService(accessToken, idToken, marketId, name, endpoint)
    }

    async getNotificationService(accessToken, idToken, serviceId){
        return await this.notificationService.getNotificationService(accessToken, idToken, serviceId)
    }

    async deleteNotificationService(accessToken, idToken, serviceId){
        return await this.notificationService.deleteNotificationService(accessToken, idToken, serviceId)
    }

    async createNotificationServiceQueue(accessToken, idToken, serviceId, name){
        return await this.notificationService.createNotificationServiceQueue(accessToken, idToken, serviceId, name)
    }

    async deleteNotificationServiceQueue(accessToken, idToken, serviceId, queueId){
        return await this.notificationService.deleteNotificationServiceQueue(accessToken, idToken, serviceId, queueId)
    }

    async getNotificationServiceQueue(accessToken, idToken, serviceId, queueId){
        return await this.notificationService.getNotificationServiceQueue(accessToken, idToken, serviceId, queueId)
    }

    /*
    *
    * CONTRACTS
    *
    */
    async getContractTemplate(accessToken, idToken, offeringId){
        return await this.contracts.getContractTemplate(accessToken, idToken, offeringId)
    }

    async createDataPurchase(accessToken, idToken, originMarketId, consumerDid, authorization, data){
        return await this.contracts.createDataPurchase(accessToken, idToken, originMarketId, consumerDid, authorization, data)
    }

    async createAgreementRawTransaction(accessToken, idToken, senderAddress, data){
        return await this.contracts.createAgreementRawTransaction(accessToken, idToken, senderAddress, data)
    }

    async deploySignedTransaction(accessToken, idToken, data){
        return await this.contracts.deploySignedTransaction(accessToken, idToken, data)
    }

    async getAgreementState(accessToken, idToken, agreementId){
        return await this.contracts.getAgreementState(accessToken, idToken, agreementId)
    }

    async getAgreement(accessToken, idToken, agreementId){
        return await this.contracts.getAgreement(accessToken, idToken, agreementId)
    }

    async getAgreementsByConsumer(accessToken, idToken, consumerId, active){
        return await this.contracts.getAgreementsByConsumer(accessToken, idToken, consumerId, active)
    }

    async getAgreementsByOffering(accessToken, idToken, offeringId){
        return await this.contracts.getAgreementsByOffering(accessToken, idToken, offeringId)
    }

    async signAgreementRawTransaction(accessToken, idToken, data){
        return await this.contracts.signAgreementRawTransaction(accessToken, idToken, 'PUT',`/SdkRefImpl/api/sdk-ri/contract/sign_agreement_raw_transaction`, data);
    }

    /*
    *
    * PRICING MANAGER
    *
    */
    async getFee(accessToken, idToken, price){
        return await this.pricingManager.getFee(accessToken, idToken, price)
    }

    async getPrice(accessToken, idToken, parameters) {
        return await this.pricingManager.getPrice(accessToken, idToken, parameters)
    }
}

exports.Connector = Connector
