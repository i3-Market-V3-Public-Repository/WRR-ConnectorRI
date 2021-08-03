const fetch = require("node-fetch")
const _ = require('underscore')
const FetchError = require('./error.js')
require('url-search-params-polyfill')

module.exports = class Connector {

  constructor(endpoint, user, password){
    this.username = user
    this.password = password
    if(user || password){
      this.fetchFromSDK_RI = true
      this.accessToken = this.getAccessToken()
      this.endpoint = "http://" + endpoint + "/SdkRefImpl/api/sdk-ri/"
    }
    else{
      this.endpoint = "http://" + endpoint + "/semantic-engine/api/registration/"
    }
    console.log("\nENDPOINT: " + this.endpoint)
  }

  /*
  * Get template to register an offering
  */
  async getTemplate(){
    let result
    if(this.fetchFromSDK_RI){
      result = await this.fetchData(this.endpoint, "GET", "offering/template")
    }else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "offering/offering-template")
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get offering details
  */
  async getOffering(offeringId){
    let result
    if(this.fetchFromSDK_RI){
      result = await this.fetchData(this.endpoint, "GET", "offering/{id}/offeringId?offering_id="+offeringId, page, size)
    }else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "offering/"+offeringId+"/offeringId")
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
   * Get list of offerings from a provider
   */
  async getProviderOfferings(provider, page, size){
    let result
    if(this.fetchFromSDK_RI){
      result = await this.fetchData(this.endpoint, "GET", "offering/{id}/providerId?provider_id="+provider, page, size)
    }else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "offering/"+provider+"/providerId", page, size)
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get list of offering from a category
  */
  async getCategoryOfferings(category, page, size){
    let result
    if(this.fetchFromSDK_RI){
      result = await this.fetchData(this.endpoint, "GET", "offering/{category}?category="+category, page, size)
    }else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "offering/"+category, page, size)
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get list of providers
  */
  async getProviders(page, size){
    let result
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "providers-list", page, size)
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get list of offerings
  */
  async getOfferings(page, size){
    let result
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "offerings-list", page, size)
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get list of categories
  */
  async getCategories(page, size){
    let result
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    else{
      result = await this.fetchDataBackplane(this.endpoint, "GET", "categories-list", page, size)
    }
    if(_.isEmpty(result)){
      return []
    }
    return result
  }

  /*
  * Get list of offerings by category
  */
  async getOfferingsByCategory(){

    let categories
    if(this.fetchFromSDK_RI){
      return "NO INFORMATION"
    }
    else{
      categories = await this.fetchDataBackplane(this.endpoint, "GET", "categories-list")
    }

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
  * Retrieve an access token from keycloak
  */
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

  /*
  *  Generic function to fetch data from SDK-RI endpoint
  */
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
        this.accessToken = getAccessToken()
        return await fetchData(method, service, params)
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

  /*
  * Generic function to fetch data from semantic engine endpoint
  */
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
      else{
        const jsonRes = await res.json()
        throw new FetchError(jsonRes.error)
      }
    } catch(e){
      console.log(e)
      throw e
    }
  }

  /*
  * Register an offering
  */
  async registerOffering(data){

    var headers = new fetch.Headers();
    headers.append("Content-Type", "application/json");

    var requestOptions = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
      redirect: 'follow'
    };

    const url = this.endpoint + "data-offering"
    console.log("\nFetch URL: " + url)

    try{
      const res = await fetch(url, requestOptions)

      if(res.status == 200){
        console.log("\nData Offering '" + data.title + "' registered.")
      }
      else{
        const jsonRes = await res.json()
        throw new FetchError(jsonRes.error)
      }

    } catch(e){
      console.log(e)
      throw e
    }
  }

  /*
  * Delete an offering
  */
  async deleteOffering(offeringId){

    var requestOptions = {
      method: 'DELETE',
      redirect: 'follow'
    };

    const url = this.endpoint + "delete-offering/" + offeringId
    console.log("\nFetch URL: " + url)

    try{
      const res = await fetch(url, requestOptions)

      if(res.status == 200){
        console.log("\nData Offering '" + offeringId + "' deleted.")
      }
      else{
        const jsonRes = await res.json()
        throw new FetchError(jsonRes.error)
      }

    } catch(e){
      console.log(e)
      throw e
    }
  }

}
