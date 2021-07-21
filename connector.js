const fetch = require("node-fetch")
require('url-search-params-polyfill');

module.exports = class Connector {

  constructor(endpoint, user, password){
    this.username = user
    this.password = password
    if(user || password){
      this.accessToken = this.getAccessToken()
      this.fetchFromSDK_RI = true
      this.endpoint = "http://" + endpoint + "/SdkRefImpl/api/sdk-ri/"
    }
    else{
      this.endpoint = "http://" + endpoint + "/semantic-engine/api/registration/"
    }
    console.log("\nENDPOINT: " + this.endpoint)
  }

  sleep(ms){
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  getTemplate(){
    if(this.fetchFromSDK_RI){
      return this.fetchData(this.endpoint, "GET", "offering/template")
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "offering/offering-template")
  }

  getOffering(offeringId){
    if(this.fetchFromSDK_RI){
      return this.fetchData(this.endpoint, "GET", "offering/{id}/offeringId?offering_id="+offeringId, page, size)
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "offering/"+offeringId+"/offeringId")
  }

  getProviderOfferings(provider, page, size){
    if(this.fetchFromSDK_RI){
      return this.fetchData(this.endpoint, "GET", "offering/{id}/providerId?provider_id="+provider, page, size)
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "offering/"+provider+"/providerId", page, size)
  }

  getCategoryOfferings(category, page, size){
    if(this.fetchFromSDK_RI){
      return this.fetchData(this.endpoint, "GET", "offering/{category}?category="+category, page, size)
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "offering/"+category, page, size)
  }

  getProviders(page, size){
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "providers-list", page, size)
  }

  getOfferings(page, size){
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    return this.fetchDataBackplane(this.endpoint, "GET", "offerings-list", page, size)
  }

  async getOfferingsByCategory(){

    let categories
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    else{
      categories = await this.fetchDataBackplane(this.endpoint, "GET", "categories-list")
    }

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

  async getAccessToken(){

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

  async fetchData(endpointUrl, method, service, params = "", page = undefined, size = undefined){
    var headers = new fetch.Headers();
    headers.append("Authorization", "Bearer " + await this.accessToken);

    var requestOptions = {
      method: method,
      headers: headers,
      redirect: 'follow'
    };

   // TODO refactor this
    var url = endpointUrl + service
    if(params){
      url += "="+params
    }
    if(page>=0){
      url += "?page="+page
    }
    if(size>0){
      url += "&size="+size
    }
    console.log("\nFetch URL: " + url)

    try{
      const res = await fetch(url, requestOptions)

      if(res.status == 401){
        console.log("\nToken has expired. Generate a new access token.")
        this.accessToken = _getAccessToken()
        return await _fetchData(method, service, params)
      }
      else if(res.status == 200){
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

  async fetchDataBackplane(semanticEngineUrl, method, endpoint, page = undefined, size = undefined){
    var requestOptions = {
      method: method,
      redirect: 'follow'
    };

    var url = semanticEngineUrl
    if(endpoint){
      url += endpoint
    }
    if(page>=0 || size>0){
      var params = new URLSearchParams()
      if(page >= 0){
        params.append("page", page)
      }
      if(size > 0){
        params.append("size", size)
      }
      url += "?"+params.toString()
    }
    console.log("\nFetch URL: " + url)

    try{
      const res = await fetch(url, requestOptions)
      if(res.status == 200){
        const jsonData = await res.json()
        return jsonData
      }
      return null
    } catch(e){
      console.log(e)
      throw e
    }
  }

}
