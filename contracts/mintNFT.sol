//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// We need to import the helper functions from the contract that we copy/pasted.
//import {Base64} from "./libraries/Base64.sol";

contract mintNFT is  ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint maxSupply = 32000;

    event NewShitNFTMinted(address sender, uint256 tokenId);
    address ownerOne;
    constructor() ERC721("confessionNFT ", "confession") {
        ownerOne = msg.sender;
        console.log("This is confessionNFT smart contract");
    }

    modifier onlyOwner() override{
        require(
            ownerOne == msg.sender ,
            "Only Owners modifier"
        );
        _;
    }

    function mintUserNFT(string memory _tokenURI) public {
        uint256 itemId = _tokenIds.current();
        require(itemId < maxSupply, "Max number of Nft are minted");

        _safeMint(msg.sender, itemId);

        _setTokenURI(itemId, _tokenURI);

        _tokenIds.increment();

        console.log(
            "An NFT w/ ID %s has been minted to %s",
            itemId,
            msg.sender
        );
        emit NewShitNFTMinted(msg.sender, itemId);
    }

    function changeMaxSupply(uint addSupply) external onlyOwner{
        maxSupply += addSupply;
    }
}
