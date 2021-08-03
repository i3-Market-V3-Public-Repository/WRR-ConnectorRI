# Connector-RI

This connector implements the logic needed to connect the SDK-RI and SDK-Core, proving an abstraction used by the Web-RI

# Quick start

```bash
npm install @UNPARALLEL/connector-ri
```

# How to use

```bash
import Connector from '@UNPARALLEL/connector-ri'
```


# SDK-RI

```bash
const connector = new Connector(ENDPOINT_URL, USERNAME, PASSWORD)
# for using SDK-RI api functions, the ENDPOINT_URL must be the corresponding endpoint from each pilot, and the USERNAME and PASSWORD must be described in order to authenticate in keycloak.
# after successfully login, the keycloak generates an access token and the connector will consume the SDK-RI api functions
```

# Semantic Engine

```bash
const connector = new Connector(ENDPOINT_URL)
# for using Semantic Engine api functions, the ENDPOINT_URL must be the corresponding endpoint from each pilot. USERNAME and PASSWORD can't be described
```

# Available functions
````bash
getOfferings() # get list of offerings
getProviders() # get list of providers
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
