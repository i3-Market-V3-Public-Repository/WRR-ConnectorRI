module.exports = class Connector {
    constructor(endpoint, username, password) {
        this.username = username
        this.password = password
        this.endpoint = endpoint
    }

    async getAccessToken(){
        const headers = new fetch.Headers({
            "Content-Type": "application/x-www-form-urlencoded"
        });

        const params = {
            'grant_type': 'password',
            'client_id': 'SDK-RI_Client',
            'client_secret': '703e0db9-a646-4f1d-bdc6-2b3fe20db08a',
            'scope': 'openid',
            'username': this.username, //'i3market',
            'password': this.password //'sgfjlsn44r50.,fsf03'
        }

        const options = {
            method: "POST",
            url: 'http://83.149.125.78:8080/auth/realms/i3market/protocol/openid-connect/token',
            headers: headers,
            body: params
        }


        try{
            const res = await fetch(options)
            const jsonData = await res.json()
            if(jsonData){
                return jsonData.access_token
            }
            return null
        } catch(e){
            console.log(e)
            throw e
        }


        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    /*
    * Retrieve an access token from keycloak
    */
    async getAccessToken1(){

        const keycloak_endpoint = "http://83.149.125.78:8080"
        // const user = "i3market"
        // const pass = "sgfjlsn44r50.,fsf03"

        var headers = new fetch.Headers();
        headers.append("Content-Type", "application/x-www-form-urlencoded");

        var params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("client_id", "SDK-RI_Client");
        params.append("client_secret", "703e0db9-a646-4f1d-bdc6-2b3fe20db08a");
        params.append("scope", "openid");
        params.append("username", this.username);
        params.append("password", this.password);

        var requestOptions = {
            method: 'POST',
            headers: headers,
            body: params,
            redirect: 'follow'
        };

        try{
            const res = await fetch(`${keycloak_endpoint}/auth/realms/i3market/protocol/openid-connect/token`, requestOptions)
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
}

