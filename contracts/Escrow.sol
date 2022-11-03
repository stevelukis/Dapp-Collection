// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Escrow {
    address public payer;
    address payable public payee;
    address public lawyer;
    uint256 public amount;

    constructor(
        address _payer,
        address payable _payee,
        uint256 _amount
    ) {
        payer = _payer;
        payee = _payee;
        lawyer = msg.sender;
        amount = _amount;
    }

    function deposit() payable public {
        require(msg.sender == payer, "Only payer can deposit money.");
        require(address(this).balance <= amount, "Fund exceeds the target amount to hold.");
    }

    function release() public {
        require(address(this).balance == amount, "Fund doesn't reach the target amount.");
        require(msg.sender == lawyer, "Only lawyer can release fund.");
        payee.transfer(amount);
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }
}