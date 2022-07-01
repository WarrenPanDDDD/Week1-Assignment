import fetch from 'node-fetch';
import 'dotenv/config'

import {BigNumber, ethers} from "ethers";
const provider = new ethers.providers.JsonRpcProvider(process.env.CRONOS_TESTNET_PROVIDER_ENDPOINT);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

const abi = [{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"}],"name":"getWeather","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"},{"internalType":"uint32","name":"temperature","type":"uint32"}],"name":"reportWeather","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const weatherRecordContract = new ethers.Contract(process.env.WEATHER_RECORD_CONTRACT_ADDRESS, abi, wallet);

// create batch Id
let batchId = parseInt(new Date().getTime() / 1000)

// get weathers for 3 cities
let cities = ["shanghai", "hongkong", "london"]
let urlPrefix = 'https://goweather.herokuapp.com/weather/'
let temperatures = []
for (let city of cities) {
    let response = await fetch(urlPrefix + city);
    let data = await response.json();
    let temperature = data.temperature.trim();

    // // accept decimal
    // temperature = temperature.match(/\d|\./g).join('');
    // result = result * parseFloat(temperature)

    temperatures.push(getTemperatureInInt(temperature))
}

// TODO: test data
// let temperatures = [12, 32, 54]

// construct transactions to report weather
const GWEI = BigNumber.from(10).pow(9)
const PRIORITY_FEE = GWEI.mul(8)
let block = await provider.getBlock(await provider.getBlockNumber())
let nonce = await wallet.getTransactionCount()
let txs = []
for (let index = 0; index < cities.length; index++) {
    let cityName = ethers.utils.formatBytes32String(cities[index])
    let temperature = temperatures[index]
    let data = weatherRecordContract.interface.encodeFunctionData('reportWeather', [batchId, cityName, temperature])
    let tx = {
        to: process.env.WEATHER_RECORD_CONTRACT_ADDRESS,
        type: 2,
        maxFeePerGas: block.baseFeePerGas.mul(2).add(PRIORITY_FEE),
        maxPriorityFeePerGas: PRIORITY_FEE,
        gasLimit: 100000,
        data: data,
        value: "0x00",
        chainId: 338,
        nonce: nonce
    }

    let signedTx = await wallet.signTransaction(tx)
    txs.push(signedTx)

    nonce++

    console.log("constructed report weather tx, city: %s, temperature: %s", cities[index], temperature)
}

// send out the txs
for (let index = 0; index < cities.length; index++) {
    await provider.sendTransaction(txs[index])
    console.log("sent tx: %s", txs[index])
}

// sleep for 10s to ensure txs are patched on chain
await new Promise(r => setTimeout(r, 10000));

// read weather from contract
for (let index = 0; index < cities.length; index++) {
    let cityName = ethers.utils.formatBytes32String(cities[index])
    let temperature = await weatherRecordContract.getWeather(batchId, cityName)
    console.log("get temperature, city: %s, temperature: %s", cities[index], temperature)
    if (temperature != temperatures[index]) {
        console.log("temperature unmatched! batchId: %s, offchain temperature: %s, onchain temperature: %s", batchId, temperatures[index], temperature)
    } else {
        console.log("temperature matched for city: %s", cities[index])
    }
}

// return temperature in Int
function getTemperatureInInt(tempString) {
    let result = 1
    if (tempString.startsWith('-')) {
        result = -1
    }

    let temperature = tempString.replace(/\D/g,'');
    result = result * parseInt(temperature)

    return result
}
