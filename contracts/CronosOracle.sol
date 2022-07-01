/**
 *Submitted for verification at cronoscan.com on 2022-01-13
 */

// Sources flattened with hardhat v2.6.1 https://hardhat.org

pragma solidity ^0.8.0;

import "./interface/chainlink/AggregatorV2V3Interface.sol";
import "./CronosOracleBase.sol";
import "./CronosOracleUpdater.sol";
import "./CronosOracleReader.sol";

contract CronosOracle is AggregatorV2V3Interface, CronosOracleBase, CronosOracleUpdater, CronosOracleReader {

    constructor(uint8 __decimals, string memory __description) {
        _decimals = __decimals;
        _description = __description;
    }

}
