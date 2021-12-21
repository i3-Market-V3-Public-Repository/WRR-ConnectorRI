# Connector-RI

This connector implements the logic needed to connect the SDK-RI and SDK-Core, providing an abstraction used by the Web-RI

# Quick start

```bash
npm install connector-ri
```

# How to use

```bash
import Connector from 'connector-ri'

const connector = new Connector(ENDPOINT_URL) # ENDPOINT_URL is the respective pilot endpoint
```

# Available functions
````bash
getOfferingTemplate() # get template for register an offering
getOfferings() # get list of offerings
getProviders() # get list of providers
getCategores() # get list of categories
getOffering(OFFERING_ID) # get details for a specific offering
getProviderOfferings(PROVIDER_ID) # get list of offerings from a provider
getCategoryOfferings(CATEGORY) # get list of offering from a category
getOfferingsByCategory() # get list of offerings by categories
registerOffering(DATA) # register a new offering
deleteOffering(OFFERING_ID) # delete an offering
````

# Example

````bash
const offerings = await connector.getProviderOfferings(PROVIDER_ID)
````
