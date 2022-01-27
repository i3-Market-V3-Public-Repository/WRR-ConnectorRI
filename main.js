const Connector = require('./connector')
// // const Connector = require('connector-ri')
// // const Connector = require('@i3m/connector-ri')
// const offeringJSON = require('./offering.json');
// const offeringWithPricingModel = require('./offering_with_pricing_model.json');

async function run(){

    // to run
    // node main.js http://95.211.3.249:8182 i3market sgfjlsn44r50.,fsf03

    // IBM instances:
    //   Sdk-RI development instance: http://95.211.3.249:8182
    //   Sdk-RI production instance: http://95.211.3.249:8181
    // SIEMENS instances:
    //   Sdk-RI development instance: http://95.211.3.244:8182
    //   Sdk-RI production instance: http://95.211.3.244:8181

    const params = process.argv.slice(2)
    this.endpoint = params[0]
    this.username = params[1]
    this.password = params[2]

    const connector = new Connector(this.endpoint, this.username, this.password)
    // const connector = new Connector(this.endpoint)

    // const template = await connector.getOfferingTemplate()
    // console.log("Offering Template: ", JSON.stringify(JSON.parse(template)))
    //
    const token = await connector._getAccessToken()
    console.log("Token", token)

    const categories = await connector.getCategories()
    console.log("Categories", categories)

    const providers = await connector.getProviders(0, 50)
    console.log("Providers", providers)

    const offerings = await connector.getOfferings(0, 50)
    console.log("Offerings", offerings)
    //
    // const offering = await connector.getOffering("provider_webri_dataoffering4")
    // console.log("Offering", offering)
    //
    // const provider = "provider_webri"
    // const providerOfferings = await connector.getProviderOfferings(provider, 0, 50)
    // console.log(`Provider: ${provider} offerings`, providerOfferings)
    //
    // const category = "Agriculture"
    // const categoryOfferings = await connector.getCategoryOfferings(category)
    // console.log(`Category: ${category} offerings`, categoryOfferings)
    //
    // const offeringsByCategory = await connector.getOfferingsByCategory()
    // console.log("Offerings by category", offeringsByCategory)

    // const newOfferingId = await connector.registerOffering({
    //   "dataOfferingTitle": "Offering from connector-ri",
    //   "category": "Agriculture",
    //   "provider": "provider_webri",
    //   "owner": "",
    //   "marketID": "",
    //   "status": "InActivated",
    // })
    // console.log(`Offering: ${newOfferingId} registered.`)

    // await connector.deleteOffering("provider_webri_dataoffering6")
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

run()
