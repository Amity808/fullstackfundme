const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  44787: {
    name: "alfajores",
    ethUsdPriceFeed: "0x022F9dCC73C5Fb43F2b4eF2EF9ad3eDD1D853946",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;


module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
