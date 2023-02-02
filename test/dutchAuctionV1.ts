import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { getAddress } from "ethers/lib/utils";

describe("BasicDutchAuction", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBasicDutchAuction() {
    const reservePrice = "10000";
    const numBlocksAuctionOpen = 1000;

    const offerPriceDecrement = "10";
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3, account4, account5] = await ethers.getSigners();

    const BasicDutchAuction = await ethers.getContractFactory("BasicDutchAuction");
    const basic_dutch_auction = await BasicDutchAuction.deploy(reservePrice, numBlocksAuctionOpen, offerPriceDecrement);

    return { basic_dutch_auction, reservePrice, numBlocksAuctionOpen, offerPriceDecrement, owner, account1, account2, account3, account4 };
  }

  describe("Deployment", function () {
    // it("Should set the right start block", async function () {
    //   const { basic_dutch_auction, auctionStartBlock } = await loadFixture(deployBasicDutchAuction);
    //   console.log(auctionStartBlock,"AUCTION START BLOCK IN TS FILE");
    //   console.log(await basic_dutch_auction.auctionStartBlock(),"AUCTION START BLOCK IN SMART CONTRACT")
    //   expect(await basic_dutch_auction.auctionStartBlock()).to.equal(auctionStartBlock);

    // });

    it("Should set the right owner", async function () {
      const { basic_dutch_auction, owner, account1 } = await loadFixture(deployBasicDutchAuction);
      console.log(await owner.getBalance(),"balanceee");
      console.log(ethers.utils.formatEther(await account1.getBalance()),"balanceee");
      
      

      expect(await basic_dutch_auction.owner()).to.equal(owner.address);
    });

    it("Should set the right reserve price", async function () {
        const { basic_dutch_auction, reservePrice } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.reservePrice()).to.equal(reservePrice);
    });

    it("Should set the right number of block auction open", async function () {
        const { basic_dutch_auction, numBlocksAuctionOpen } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.numBlocksAuctionOpen()).to.equal(numBlocksAuctionOpen);
    });

    it("Should set the right offer price decrement", async function () {
        const { basic_dutch_auction, offerPriceDecrement } = await loadFixture(deployBasicDutchAuction);
  
        expect(await basic_dutch_auction.offerPriceDecrement()).to.equal(offerPriceDecrement);
    });

  });
  describe("Aucion", function () {
    it("Buyer 1 will bid", async function () {
      const { basic_dutch_auction, account1, account2, account3, account4 } = await loadFixture(deployBasicDutchAuction);
      await basic_dutch_auction.connect(account1).bid({value: '100'});
      await basic_dutch_auction.connect(account2).bid({value: '5000'});
      expect(await (await basic_dutch_auction.bids(0)).bidder).to.equal(account1.address);
      expect(await (await basic_dutch_auction.bids(0)).amount).to.equal('100');
      expect(await (await basic_dutch_auction.bids(1)).bidder).to.equal(account2.address);
      expect(await (await basic_dutch_auction.bids(1)).amount).to.equal('5000');
      await basic_dutch_auction.connect(account3).bid({value: '50000'});
      await expect(basic_dutch_auction.connect(account4).bid({value: '1000'})).to.be.revertedWith(
        "auction is ended"
      );
    });

    // it("Buyer 2 will bid", async function () {
    //     const { basic_dutch_auction, account2 } = await loadFixture(deployBasicDutchAuction);
    //     await basic_dutch_auction.connect(account2).bid({value: ethers.utils.parseEther('5')});
    //     expect(await (await basic_dutch_auction.bids(0)).bidder).to.equal(account2.address);
    //     expect(await (await basic_dutch_auction.bids(0)).amount).to.equal(ethers.utils.parseEther('5'));
    //   });
});
});
