# Coinbase Onramp Demo App

This project serves to be a demo to utilize Coinbase Onramp 

## Getting Started

### Environment Setup

Install System Dependencies

- Nodejs
- yarn

Install App dependencies

```bash
yarn
```


### CDP (Coinbase Developer Platform) setup

#### Enable Onramp on [CDP](https://portal.cdp.coinbase.com)

![onramp option](/readme-assets/onramp-menu-bar-view.png)

#### Issue API Key, that will be used in .env file on [CDP](https://portal.cdp.coinbase.com)

![cdp api key](/readme-assets/cdp-api-key-view.png)

#### Issue OnchainKit API Key on [CDP](https://portal.cdp.coinbase.com)

![onchainkit api key](/readme-assets/onchainkit-setup.png)

Add API Keys into your .env file

### Running the app
run the development server:

```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Coinbase Onramp, take a look at the following resources:

- [Coinbase Onramp](https://docs.cdp.coinbase.com/onramp/docs/welcome) - Learn more about Coinbase Onramp

You can check out [the CDP Docs](https://docs.cdp.coinbase.com/) for more apis
