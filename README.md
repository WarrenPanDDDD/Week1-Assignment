# Week 1 Assignment

assignment 1: To get latest BTC/USD price from Cronos Oracle. Plz check out read-btc-price.js
<br />
assignment 2: To post weather data to smart contract. Plz check out post-weather-data.js

## Description

assignment 1: Get latest BTC/USD price from Cronos Oracle, log out in console every minute.

assignment 2: Get weather data for cities from https://goweather.herokuapp.com/weather/, then post the temperatures to smart contract WeatherRecord. I manage nonces manually to avoid nonce conflicts when sending multiple txs at the same time

## Getting Started

### Dependencies

* nodejs
* ethers
* dotenv
* node-fetch

### Installing

```
npm install
```

### Executing program

execute assignment 1:

```
cd app

node read-btc-price.js 
```

execute assignment 2:

```
cd app

node post-weather-data.js 
```

## License

This project is licensed under the [ISC] License 

