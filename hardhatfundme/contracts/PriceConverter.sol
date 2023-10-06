// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // libary can't have state variable 
    // the variable must be internal
    function getprice(AggregatorV3Interface priceFeed) internal  view returns (uint256)  {
        // ABI
        // Address of the 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        (,int answer,,,) = priceFeed.latestRoundData();
        // price of eth to usd
        return uint256(answer * 1e10); //10 in 18
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // we want to get the amount of the eth send in msg.value in the USD
        uint256 ethPrice = getprice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e10;
        return ethAmountInUsd;
    }
}