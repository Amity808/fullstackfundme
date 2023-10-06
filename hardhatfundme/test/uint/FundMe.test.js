const { assert, expect } = require("chai");
const { parseEther } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = parseEther("1");
  beforeEach(async function () {
    // deploy our fundMe contract using
    // harhat deploy

    // to get the name of the account we deploy on
    deployer = (await getNamedAccounts()).deployer;
    // or const { depolyer } = await getNamedAccounts()
    // or
    // const accounts = ethers.getSigner()
    // const accountZero = accounts[0]

    await deployments.fixture(["all"]);
    // this function will get us the most recent deploy contract
    fundMe = await ethers.getContract("FundMe", deployer);
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("sets the aggregator address correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.target);
    });
  });

  describe("fund", async function () {
    it("fail if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "Did't send enough, should be more than 1 ether"
      );
      // await fundMe.fund()
    });
    it("update the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFunded(deployer);
      assert.equal(response.toString(), sendValue.toString());
    });
    it("add funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async function () {
    // we need to fund the contract before we test the withdrw
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single funder", async function () {
      // arrange
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      // act,
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      const endingDeployerMeBalance = await ethers.provider.getBalance(
        deployer
      );
      // assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerMeBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw with multiple funders", async function () {
      const accounts = await ethers.getSigner();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }
      const startingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      const startingDeployerBalance = await ethers.provider.getBalance(
        deployer
      );
      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);
      // assert
      const endingFundMeBalance = await ethers.provider.getBalance(
        fundMe.target
      );

      const endingDeployerMeBalance = await ethers.provider.getBalance(
        deployer
      );
      // assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerMeBalance.add(gasCost).toString()
      );

      // make sure that the founder are reset properly
      await expect(fundMe.founders(0)).to.be.reverted;

      for (let i = 0; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });
  });
});
