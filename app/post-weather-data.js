import fetch from 'node-fetch';
import 'dotenv/config'

import {BigNumber, ethers} from "ethers";
const provider = new ethers.providers.JsonRpcProvider(process.env.CRONOS_TESTNET_PROVIDER_ENDPOINT);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

const abi = [{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"}],"name":"getWeather","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint32","name":"batchId","type":"uint32"},{"internalType":"bytes32","name":"cityName","type":"bytes32"},{"internalType":"uint32","name":"temperature","type":"uint32"}],"name":"reportWeather","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const weatherRecordContract = new ethers.Contract(process.env.WEATHER_RECORD_CONTRACT_ADDRESS, abi, wallet);

// step 1: create batch Id
let batchId = parseInt(new Date().getTime() / 1000)
console.log("batchId: ", batchId)

// step 2.1: get weathers for 3 cities
let cities = ["shanghai", "hongkong", "london"]
let urlPrefix = 'https://goweather.herokuapp.com/weather/'
let temperatures = []
for (let city of cities) {
    let response = await fetch(urlPrefix + city);
    let data = await response.json();
    let temperature = data.temperature.trim();

    temperatures.push(getTemperatureInInt(temperature))
}

// step 2.2: construct transactions to report weather
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

// step 2.3: send out the txs
for (let index = 0; index < cities.length; index++) {
    await provider.sendTransaction(txs[index])
    console.log("sent tx: %s", txs[index])
}

// sleep for 10s to ensure txs are patched on chain
await new Promise(r => setTimeout(r, 10000));

// step 3: read weathers from contract
for (let index = 0; index < cities.length; index++) {
    let cityName = ethers.utils.formatBytes32String(cities[index])
    let temperature = await weatherRecordContract.getWeather(batchId, cityName)
    console.log("get temperature, city: %s, temperature: %s", cities[index], temperature)
}

// step 3 additional: read weathers from contract in ONE call
const multiCallAbi = [{"inputs":[{"components":[{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"callData","type":"bytes"}],"internalType":"struct Multicall.Call[]","name":"calls","type":"tuple[]"}],"name":"aggregate","outputs":[{"internalType":"uint256","name":"blockNumber","type":"uint256"},{"internalType":"bytes[]","name":"returnData","type":"bytes[]"}],"stateMutability":"nonpayable","type":"function"}]
const multiCallContract = new ethers.Contract(process.env.MULTI_CALL_CONTRACT_ADDRESS, multiCallAbi, wallet);
let calls = []
for (let index = 0; index < cities.length; index++) {
    let cityName = ethers.utils.formatBytes32String(cities[index])
    let data = weatherRecordContract.interface.encodeFunctionData('getWeather', [batchId, cityName])
    let call = {
        "target" : process.env.WEATHER_RECORD_CONTRACT_ADDRESS,
        "callData" : data
    }
    calls.push(call)
}
let callData = multiCallContract.interface.encodeFunctionData('aggregate', [calls])
let multiCallResultHexString = await provider.call({
    to : process.env.MULTI_CALL_CONTRACT_ADDRESS,
    data : callData
})
let multiCallResult = multiCallContract.interface.decodeFunctionResult("aggregate", multiCallResultHexString)
for (let index = 0; index < cities.length; index++) {
    let weatherRecordCallResultHexString = multiCallResult.returnData[index]
    let temperature = weatherRecordContract.interface.decodeFunctionResult("getWeather", weatherRecordCallResultHexString)[0]
    console.log("get temperature, city: %s, temperature: %s", cities[index], temperature)
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
