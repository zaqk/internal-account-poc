// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import { AccountManager } from "./AccountManager.sol";
import { Item, Character } from "./NFTs.sol";


contract Logic {
  
  AccountManager public immutable accountManager;
  Item public immutable item;
  Character public immutable character;

  constructor(address _accountManager, address _item, address _character) {
    accountManager = AccountManager(_accountManager);
    item = Item(_item);
    character = Character(_character);
  }

  function useItem(uint256 _charId, uint256 _itemId) external {
    require(accountManager.getGameAccount(msg.sender) == character.ownerOf(_charId), "NOT_AUTHORIZED");
    character.useItem(_charId, _itemId);
  }

}