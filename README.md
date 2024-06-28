<p align="middle">
  <img src="https://user-images.githubusercontent.com/766679/236442723-004fc7a5-edb2-4477-86da-0b687d62702f.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>@rsksmart/rif-wallet-services</code></h3>
<p align="middle">
  RIF Wallet Services
</p>
<p align="middle">
  <a href="https://github.com/rsksmart/rif-wallet-services/actions/workflows/ci.yml" alt="ci">
    <img src="https://github.com/rsksmart/rif-wallet-services/actions/workflows/ci.yml/badge.svg" alt="ci" />
  </a>
</p>

RIF Wallet Services is a server application that provides basic account querying API to bootstrap your app.

## Usage

The API is as follows. Fin the response types in `src/types.ts`

> Use addresses in lower case
> chainId query param is optional
> default value for chainId query param is 31(TestNet)

### Tokens

Get the list of all the tokens in the RSK network

```
GET /tokens -> IToken[]
Query param: chainId
```

### Addresses

Get the tokens of an address:


```
GET /address/:address/tokens -> ITokenWithBalance[]
Query param: chainId
```

Get the events related to a given address

```
GET /address/:address/events -> IEvent[]
Query param: chainId
```

Get the incoming and outgoing transactions of a given address

```
GET /address/:address/transactions -> IApiTransactions[]
Query params: limit, prev, next, chainId
```

### Prices
Get prices for tokens
```
GET /price
Query params: addresses, convert
Example:
- addresses: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5,0xef213441a85df4d7acbdae0cf78004e1e486bb96'
- convert: 'USD'
For BTC price indicate BTC in addresses
For ERC 20 Token indicate the smart contract address
```

## Run for development

### API Keys

Get a API key from CoinMarketCap and put it in the `.env` file.

### Install

Install dependencies:

```
npm i
```

Run tests:

```
npm test
npm test:watch
```

Lint the code:

```
npm run lint
npm run lint:fix
```

Start the service:

```
npm run start
npm run start:prod
```

### Branching model

- `main` has latest release. PRs need to pass `ci`. Do merge commits.
- `develop` has latest approved feature. PRs need to pass `ci`. Do squash&merge.
- Use branches pointing to `develop` to add new PRs.
- Do external PRs against latest commit in `develop`.

### Documentation

- Documentation is located in docs directory.
- We use PlantUML to write our class diagram.
- You can visit https://plantuml.com/ to check more about it.
- API documentation is in /api-docs endpoint - GET
- WebSocket documentation is in docs/websocket.md
  - Markdown file is generated frowm websocket.yaml using @asyncapi/markdown-template


## Indexers
We provide two different indexer integrations to get balances, transactions, events:
- RSKExplorerAPI(Default)
- BlockscoutAPI
To use RSKExplorerAPI, you should set profile environment variable into PROFILE=wallet
To use BlockscoutAPI, you should set profile environment variable into PROFILE=dao
