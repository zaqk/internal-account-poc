// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

contract AccountManager {

  address public owner;

  // internal account => external account
  mapping(address => address) public getGameAccount;

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
   require(msg.sender == owner, "only owner");
   _;
  }

  function updateAccount(
    address _internal, // internal game account
    address _external  // external user account
  ) external onlyOwner {
    getGameAccount[_internal] = _external;
  }

}