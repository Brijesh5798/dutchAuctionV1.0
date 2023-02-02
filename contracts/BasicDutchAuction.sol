//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BasicDutchAuction {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private bidCount;

    uint256 public auctionStartBlock;
    uint256 public reservePrice;
    uint256 public numBlocksAuctionOpen;
    uint256 public offerPriceDecrement;
    uint256 public initialPrice;
    uint256 public auctionEndBlock;
    address payable public owner;
    struct bidStruct {
        address bidder;
        uint256 amount;
    }
    mapping (uint256 => bidStruct) public bids;
    bool private ended;

    modifier isAuctionValid() {
        require(ended == false, "auction is ended");
        require(block.timestamp > auctionStartBlock, "auction is not started yet");
        require(block.timestamp < auctionEndBlock, "auction is ended");
        _;
    }
    constructor(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        reservePrice = _reservePrice;
        numBlocksAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        initialPrice = reservePrice.add(numBlocksAuctionOpen.mul(offerPriceDecrement));
        auctionStartBlock = block.timestamp;
        auctionEndBlock = block.timestamp.add(_numBlocksAuctionOpen);
        owner = payable(msg.sender);
        ended = false;

    }

    function bid() isAuctionValid() public payable returns(address)  {
        uint256 blockPassed = block.timestamp.sub(auctionStartBlock);
        uint256 currentPrice = initialPrice.sub(blockPassed.mul(offerPriceDecrement));
        if (msg.value >= currentPrice){
            finalize();
        }
        else {
            bids[bidCount.current()] = bidStruct(msg.sender, msg.value);
            bidCount.increment();
        }
        return msg.sender;
    }

    function finalize() internal {
        owner.transfer(msg.value);
        ended = true;
        refund();
    }

    function refund() internal {
        for (uint256 i=0; i<=bidCount.current(); i++){
            address payable bidder = payable (bids[i].bidder);
            bidder.transfer(bids[i].amount);
        }
    }
}
