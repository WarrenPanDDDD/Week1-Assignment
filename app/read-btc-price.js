import 'dotenv/config'

import ethers from "ethers";
const provider = new ethers.providers.JsonRpcProvider(process.env.CRONOS_PROVIDER_ENDPOINT);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

// only need ABI for latestAnswer and latestTimestamp
const miniABI = [{"inputs":[],"name":"latestAnswer","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
const cronosOracleContract = new ethers.Contract(process.env.CRONOS_ORALCE_CONTRACT_ADDRESS, miniABI, wallet);

// from the creation contract transaction, we can see the decimal is 8
const decimal = 8

console.log("Get BTC/USD price from Cronos Oracle")
while (true) {
    let priceBN = await cronosOracleContract.latestAnswer()
    let timestampBN = await cronosOracleContract.latestTimestamp()
    let date = new Date(timestampBN.toString() * 1000)
    let price = priceBN.toString() / Math.pow(10, decimal)
    console.log("Latest BTC/USD price is: %s, latest price created at: %s, current time: %s", price, date, new Date())
    await new Promise(r => setTimeout(r, 1000));
}