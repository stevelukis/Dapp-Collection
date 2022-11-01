// SPDX-License-Identifier: UNLICENSED;
pragma solidity ^0.8.0;
contract SplitPayment {
    address public owner;

    constructor (address _owner) {
        owner = _owner;
    }

    function send(address payable[] memory to, uint[] memory amount) public payable onlyOwner {

        require(to.length == amount.length, 'to and amount array must have same length.');
        for (uint i = 0; i < to.length; i++) {
            to[i].transfer(amount[i]);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}