const fetch = require("node-fetch")

module.exports = class Connector{

 constructor(endpoint, user, secret){
    this.endpoint = endpoint
    this.user = user
    this.secret = secret
 }

 test() {
   console.log(this.endpoint, this.user, this.secret)
   console.log("testing response from connector class")
 }

 async getOfferings(providerId){
   var headers = new fetch.Headers();
   headers.append("Cookie", this.secret);

   var requestOptions = {
     method: 'GET',
     headers: headers,
     redirect: 'follow'
   };

   try{
     const res = await fetch(`${this.endpoint}/offering/{id}/providerId?provider_id=${providerId}&page=0&size=10`, requestOptions)
     const jsonData = await res.json()
     if(jsonData && jsonData.statusCode == 200 && jsonData.data){
       return jsonData.data
     }
     return null
   } catch(e){
     console.log(e)
     throw e
   }
 }

 async getOffering(offeringId){
   var headers = new fetch.Headers();
   headers.append("Cookie", this.secret);

   var requestOptions = {
     method: 'GET',
     headers: headers,
     redirect: 'follow'
   };

   try{
     const res = await fetch(`${this.endpoint}/offering/{id}/offeringId?offering_id=${offeringId}&page=0&size=10`, requestOptions)
     const jsonData = await res.json()
     if(jsonData && jsonData.statusCode == 200 && jsonData.data){
       return jsonData.data
     }
     return null
   } catch(e){
     console.log(e)
     throw e
   }
 }

 async getOfferingsByCategory(category) {
   var headers = new fetch.Headers();
   headers.append("Cookie", this.secret);

   var requestOptions = {
     method: 'GET',
     headers: headers,
     redirect: 'follow'
   };

   try{
     const res = await fetch(`${this.endpoint}/offering/{category}?category=${category}&page=0&size=10`, requestOptions)
     const jsonData = await res.json()
     if(jsonData && jsonData.statusCode == 200 && jsonData.data){
       return jsonData.data
     }
     return null
   } catch(e){
     console.log(e)
     throw e
   }
 }

 async getOfferingTemplate(){
   var headers = new fetch.Headers();
   headers.append("Cookie", this.secret);

   var requestOptions = {
     method: 'GET',
     headers: headers,
     redirect: 'follow'
   };

   try{
     const res = await fetch(`${this.endpoint}/offering/template`, requestOptions)
     const jsonData = await res.json()
     if(jsonData && jsonData.statusCode == 200 && jsonData.data){
       return jsonData.data
     }
     return null
   } catch(e){
     console.log(e)
     throw e
   }
 }

}





//
// module.exports = {
//     test: function () {
//       return _test()
//     },
//
//     getOfferings: function(providerId){
//       return _getOfferingsByProvider(providerId)
//     },
//
//     getOffering: function(offeringId){
//       return _getOffering(offeringId)
//     },
//
//     getOfferingsByCategory: function(category){
//       return _getOfferingsByCategory(category)
//     },
//
//     getOfferingTemplate: function(){
//       return _getOfferingTemplate()
//     }
// }
/*
const fetch = require("node-fetch")
const apiUrl = "http://95.211.3.251:8181/SdkRefImpl/api/sdk-ri"
const cookie = "JSESSIONID=node0x63rtee91ysm10sj74podl74f62.node0; OAuth_Token_Request_State=4cf29d54-16cb-4caa-b9c6-ff8881ffb3b6"

async function _getOfferingsByProvider(providerId){
  var headers = new fetch.Headers();
  headers.append("Cookie", cookie);

  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };

  try{
    const res = await fetch(`${apiUrl}/offering/{id}/providerId?provider_id=${providerId}&page=0&size=10`, requestOptions)
    const jsonData = await res.json()
    if(jsonData && jsonData.statusCode == 200 && jsonData.data){
      return jsonData.data
    }
    return null
  } catch(e){
    console.log(e)
    throw e
  }
}

async function _getOffering(offeringId){
  var headers = new fetch.Headers();
  headers.append("Cookie", cookie);

  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };

  try{
    const res = await fetch(`${apiUrl}/offering/{id}/offeringId?offering_id=${offeringId}&page=0&size=10`, requestOptions)
    const jsonData = await res.json()
    if(jsonData && jsonData.statusCode == 200 && jsonData.data){
      return jsonData.data
    }
    return null
  } catch(e){
    console.log(e)
    throw e
  }
}

async function _getOfferingsByCategory(category) {
  var headers = new fetch.Headers();
  headers.append("Cookie", cookie);

  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };

  try{
    const res = await fetch(`${apiUrl}/offering/{category}?category=${category}&page=0&size=10`, requestOptions)
    const jsonData = await res.json()
    if(jsonData && jsonData.statusCode == 200 && jsonData.data){
      return jsonData.data
    }
    return null
  } catch(e){
    console.log(e)
    throw e
  }
}

async function _getOfferingTemplate(){
  var headers = new fetch.Headers();
  headers.append("Cookie", cookie);

  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };

  try{
    const res = await fetch(`${apiUrl}/offering/template`, requestOptions)
    const jsonData = await res.json()
    if(jsonData && jsonData.statusCode == 200 && jsonData.data){
      return jsonData.data
    }
    return null
  } catch(e){
    console.log(e)
    throw e
  }
}

function _test(){
  console.log("testing response from connector")
}*/
