# Week 1 Assignment

assignment 1: To get latest BTC/USD price from Cronos Oracle. Plz check out app/read-btc-price.js/

assignment 2: To post weather data to smart contract. Plz check out app/post-weather-data.js
<br />
addtional task 1-2: Write in text, plz check out ./Assignment 1 additional
<br />
addtional task 3: To make multicall in ONE call. Plz check out app/post-weather-data.js

## Description

assignment 1: Get latest BTC/USD price from Cronos Oracle, log out in console every minute.
<br />
assignment 2: Get weather data for cities from https://goweather.herokuapp.com/weather/, then post the temperatures to smart contract WeatherRecord. I manage nonces manually to avoid nonce conflicts when sending multiple txs at the same time
<br />
addtional task 3: I deployed a MultiCall contract at 0x170832DF067101a2Cc2f273a75fbff34EbbD712E

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

execute assignment 2 & addtional task 3:

```
cd app

node post-weather-data.js 
```

## License

This project is licensed under the [ISC] License 

