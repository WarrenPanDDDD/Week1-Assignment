// File contracts/CronosOracleUpdater.sol
pragma solidity ^0.8.0;

import "./CronosOracleStorage.sol";
import "./CronosOracleBase.sol";

contract CronosOracleUpdater is CronosOracleStorage, CronosOracleBase {
    event PriceUpdated(
        uint256 indexed roundId,
        uint256 indexed timestamp,
        int256 indexed price
    );

    function updatePrice(
        uint256 _roundId,
        uint256 _timestamp,
        int256 _newPrice
    ) external onlyOwner {
        lastCompletedRoundId = _roundId;
        lastUpdatedTimestamp = _timestamp;
        prices[_roundId] = _newPrice;
        updatedTimestamps[_roundId] = _timestamp;

        emit PriceUpdated(_roundId, _timestamp, _newPrice);
    }
}
