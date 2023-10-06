// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// get funds from user
// withdraw funds 
// set minimun value with USD
// to be able to set minimum fund amount
// want to be able to send the minimun amount in USD 

import './PriceConverter.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// constact immutable

// error function
error FundMe_NotOwner();

/**@title A contract for crownd funding
 * @author Bolarinwa Muhdsodiq
 * @notice This contract is an upgrade version and just to demo asimple fund me contract
 * @dev this implement price feed to be deploy on sepolia and alfajories
*/

contract FundMe {
    // Type declaration
    using PriceConverter for uint256;
    
    // State varialbles
    // immutable variable
    uint256 public constant minmumUSD = 50 * 1e18;

    address[] public funders;
    // to know the amoount of money this people actual spent
    mapping (address => uint256) public addressToAmountFunded;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress){
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // modifier
    modifier onlyOwner{
        // require(msg.sender == i_owner, "Sender is not owner");
        // require(msg.sender == i_owner, FundMe_NotOwner());
        if(msg.sender != i_owner) { revert FundMe_NotOwner(); }
        _;
    }

    function fund() public payable {
        // msg.value.getConversionRate();
        require(msg.value.getConversionRate(priceFeed) >= minmumUSD, "Did't send enough, should be more than 1 ether");

        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    
    // we have to set the funded amount to zero
    function withdraw() public onlyOwner {
        
        // using for loop start index ending index step ahead
        for (uint256 founderIndex = 0; founderIndex < funders.length; founderIndex++) {
            address funder =  funders[founderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // we need to reset array the funder and withdraw
        // to reset the array
        funders = new address[](0);
        // actual withdraw the funds
        // we have three ways to withraw, 1. transfer, 2. send, 3.call
        payable(msg.sender).transfer(address(this).balance);
        // send way
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, 'Send Failed');
        // call
        (bool callSuccess, )=payable (msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "call failed");
    }
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}