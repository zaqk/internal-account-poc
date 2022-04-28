// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import { SimpleERC721 } from "./SimpleERC721.sol";

contract Item is SimpleERC721 {

  constructor(string memory _name, string memory _symbol) SimpleERC721(_name, _symbol) {}

}

contract Character is SimpleERC721 {

  Item public immutable item;

  // tokenId => count of items used/burned
  mapping(uint256 => uint256) getItemUsageCount;
  
  constructor(string memory _name, string memory _symbol, address _item) SimpleERC721(_name, _symbol) {
    item = Item(_item);
  }

  function useItem(uint256 _tokenId, uint256 _itemId) external {
    getItemUsageCount[_tokenId] = getItemUsageCount[_tokenId]++;
    item.burn(_itemId);
  }

}
