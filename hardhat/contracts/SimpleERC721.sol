// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import { ERC721 } from "@rari-capital/solmate/src/tokens/ERC721.sol";

import 'hardhat/console.sol';

abstract contract SimpleERC721 is ERC721 {

  uint256 tokenId;

  constructor(
    string memory _name, 
    string memory _symbol
  ) ERC721(_name, _symbol) {
  }

  function mint() external returns (uint256) {
    _mint(msg.sender, tokenId++);
    return tokenId;
  }

  function burn(uint256 _tokenId) external {
    address owner = ownerOf[_tokenId];

    require( 
      tx.origin == owner 
      || isApprovedForAll[owner][tx.origin] 
      || getApproved[_tokenId] == tx.origin,
      "NOT_AUTHORIZED_TO_BURN"
    );
    _burn(_tokenId);
  }

  function tokenURI(uint256) public pure override returns (string memory) {
    return "";
  }

}