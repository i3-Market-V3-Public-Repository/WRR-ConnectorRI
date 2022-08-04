const Logger = require("js-logger");
const axios = require("axios");
const FetchError = require("./error");

class Oidc {
    constructor() { }

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
}

exports.Oidc = Oidc
