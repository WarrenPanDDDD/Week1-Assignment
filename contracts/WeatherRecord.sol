pragma solidity ^0.8.0;

contract WeatherRecord {

    mapping(uint32 => mapping(bytes32 => uint32)) private weatherRecords;

    function reportWeather(uint32 batchId, bytes32 cityName, uint32 temperature) external {
        weatherRecords[batchId][cityName] = temperature;
    }

    function getWeather(uint32 batchId, bytes32 cityName) public view returns (uint32) {
        return weatherRecords[batchId][cityName];
    }
}