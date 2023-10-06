// no import no calling function main since we are using hardhat depoly package

// function deployFunc() {
//     console.log("hi")
// }

// module.exports.default = deployFunc;

// module.exports.default = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // well what happen when we want to change chains
  // when going for localhost or hardhat network to use a mock

  // if the blockachain dosen't have the price feed
  //  contract address doesn't exist, we dploy a minimal version of
  // for our locsal testing depoly a mock

  // if cahin id is X use address y
  // if chainid is A use Z
  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUSDAgregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUSDAgregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // contructor arguments
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //address of the price feed or any argument in the contructor
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  // if not networks
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // then verify
    // const fundMeAdd = await fundMe.address
    log(`contract Address ${fundMe.address}`);
    await verify(fundMe.address, args);
  }
  log("-------------------");
};

module.exports.tags = ["all", "fund"];
