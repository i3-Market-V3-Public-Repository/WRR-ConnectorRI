# Connector-RI

This connector implements the logic needed to connect the SDK-RI, providing an abstraction used by the Web-RI.

## Installation

```javascript
npm install @unparallel/connector-ri
```

## How to use

```javascript
import Connector from '@unparallel/connector-ri'

const connector = new Connector(SDK_RI_ENDPOINT, LOG_LEVEL)
// SDK_RI_ENDPOINT: pilot endpoint
// LOG_LEVEL (optional): logs level (more info: https://github.com/jonnyreeves/js-logger)
```

### Available functions
```javascript
getOfferingTemplate(accessToken, idToken) // get template for register an offering
getOfferings(accessToken, idToken) // get list of offerings
getProviders(accessToken, idToken) // get list of providers
getCategories(accessToken, idToken) // get list of categories
getOffering(accessToken, idToken, OFFERING_ID) // get details for a specific offering
getProviderOfferings(accessToken, idToken, PROVIDER_ID) // get list of offerings from a provider
getCategoryOfferings(accessToken, idToken, CATEGORY) // get list of offering from a category
getOfferingsByCategory(accessToken, idToken) // get list of offerings by categories
getOfferingContractParameters(accessToken, idToken, OFFERING_ID) // get list of contract parameters from a specific category
registerOffering(accessToken, idToken, DATA) // register a new offering
deleteOffering(accessToken, idToken, OFFERING_ID) // delete an offering
updateOffering(accessToken, idToken, DATA) // update an offering
```

### Example

```javascript
const offerings = await connector.getProviderOfferings(accessToken, idToken, PROVIDER_ID)
```


## Credits
This repository has been created by:

Márcio Mateus [marcio.mateus@unparallel.pt](mailto:marcio.mateus@unparallel.pt)

Pedro Ferreira [pedro.ferreira@unparallel.pt](mailto:marcio.mateus@unparallel.pt)

## License
The code in ths repository is licensed under the [MIT License](https://opensource.org/licenses/MIT).

___
###### This work was done in the context of i3-MARKET Research Project, which has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 871754
