pragma solidity ^0.8.0;

contract CronosOracleStorage {
    uint8 public _decimals;
    string public _description;
    uint256 public constant _version = 2;

    uint256 internal lastCompletedRoundId;
    uint256 internal lastUpdatedTimestamp;

    mapping(uint256 => int256) internal prices; // roundId to price
    mapping(uint256 => uint256) internal updatedTimestamps; // roundId to timestamp
}
