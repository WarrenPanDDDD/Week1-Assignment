// File contracts/CronosOracleReader.sol

pragma solidity ^0.8.0;

import "./CronosOracleStorage.sol";
import "./interface/chainlink/AggregatorV2V3Interface.sol";

contract CronosOracleReader is CronosOracleStorage, AggregatorV2V3Interface {
    string private constant V3_NO_DATA_ERROR = "No data present";

    function latestAnswer() external view override returns (int256) {
        return prices[lastCompletedRoundId];
    }

    function latestTimestamp() external view override returns (uint256) {
        return updatedTimestamps[lastCompletedRoundId];
    }

    function latestRound() external view override returns (uint256) {
        return lastCompletedRoundId;
    }

    function getAnswer(uint256 _roundId)
        external
        view
        override
        returns (int256)
    {
        return prices[_roundId];
    }

    function getTimestamp(uint256 _roundId)
        external
        view
        override
        returns (uint256)
    {
        return updatedTimestamps[_roundId];
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return _getRoundData(_roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return _getRoundData(uint80(lastCompletedRoundId));
    }

    /*
     * Internal
     */

    function _getRoundData(uint80 _roundId)
        internal
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        answer = prices[_roundId];
        uint64 timestamp = uint64(updatedTimestamps[_roundId]);

        require(timestamp > 0, V3_NO_DATA_ERROR);

        return (_roundId, answer, timestamp, timestamp, _roundId);
    }
}
