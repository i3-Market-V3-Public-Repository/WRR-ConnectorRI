const percentEncode = require("@stdlib/string-percent-encode");

class Vc {
    constructor() { }

    getIssueCredentialUrl(vc_url, credential, callbackUrl){
        const encodedCredential = percentEncode(JSON.stringify(credential))
        const encodedCallbackUrl = percentEncode(callbackUrl)
        return `${vc_url}/credential/issue/${encodedCredential}/callbackUrl/${encodedCallbackUrl}`;
    }
}

exports.Vc = Vc
