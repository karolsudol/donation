// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title A Donation contract
 * @dev A contract that allows address that deployed it to receive funds and then withdraw them back to the same address with full visibility of received funds.
 */
contract Donation {

    /** **** Events **** */
    event Donate(address indexed from, uint256 amount);
    event ReleaseFunds(address indexed to, uint256 amount);

    /** **** State Variables **** */
    address public owner;
    mapping(address => uint256) public amounts;
    address[] public donors;
    uint256 public totalAmount;

    // custo error
    //  error InsufficientBalance(uint balance, uint withdrawAmount);

    constructor () {
        owner = msg.sender;
    }

    /** **** View Functions ****  */


  /**
   * @dev getDonors returns array of donors addresses
   *
   */
    function getDonors ()external view returns (address[] memory ){
        return donors;   
    }

    /** **** State Changing External Functions **** */

  /**
   * @dev donate accepts funds as a payment and records its sender and amount it received
   *
   * Emits a {Donate} event.
   */
    function donate() external payable {
        uint256  amount  = msg.value;
        require(amount > 0,"donations cannot be 0");

        amounts[msg.sender] += amount;
        totalAmount += amount;

        if (amounts[msg.sender] > 0){
            donors.push(msg.sender);
        }

        emit Donate(msg.sender, amount);
    }

  /**
   * @dev releaseFunds releases funds to the owner of the contract.
   *
   * @param to owners address
   * @param amount amount denominated in ETH
   *
   * Emits a {ReleaseFunds} event.
   */
    function releaseFunds(address to, uint256 amount) external {
        require(msg.sender == owner, "only ownwer can request funds release");
        require(msg.sender != address(0), "address 0");
        require(to != address(0), "address 0");

        // @teacher: below does not compile ?
        // if (totalAmount < amount) {
        //     revert InsufficientBalance({balance: totalAmount, withdrawAmount: amount});
        // }
        require(totalAmount >= amount, "amount requested unsufficient");

        // @teacher "anything to worry about the `amount` warning: conversion truncates uint256 to uint128, as value is type uint128 on target evm" ?
        payable(to).transfer(amount);
        totalAmount -= amount;

        emit ReleaseFunds(owner, amount); 
    }

}