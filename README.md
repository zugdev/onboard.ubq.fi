# `@ubiquity/onboard.ubq.fi`

Generates the configuration for organizations, by creating a default configuration and creating a repository under the 
given Organization.

## Requirements

Copy the `env.example` to `.env` and fill the required variables.

## Run

```shell
yarn start
```
Should make the front-end page available at [http://localhost:8080](http://localhost:8080).

### Required fields
- `CHAIN_ID`: the id of the network you want to use for the transactions
- `WALLET_PRIVATE_KEY`: the [64 digits](https://www.browserling.com/tools/random-hex) crypto wallet key that will be used for transactions
- `GITHUB_PAT`: a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)
- `ORG_NAME`: the name of the [organization](https://github.com/settings/organizations) where you want to add the bot

## Testing
To test with the Studio open, run
```shell
yarn cy:open
```

Otherwise to simply run the tests through the console, run
```shell
yarn cy:run
```
