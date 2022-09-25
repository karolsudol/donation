// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title A Donation contract
 * @dev A contract that allows address that deployed it to receive funds and then withdraw them back to the same address with full visibility of received funds.
 */
contract Donation {

    /** **** Events **** */
    event Donate(address indexed from, uint256 amount, uint256 ts);
    event ReleaseFunds(address indexed to, uint256 amount, uint256 ts);

    /** **** State Variables **** */
    address public owner;
    mapping(address => uint256) public amounts;
    address[] public donors;

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

        amounts[msg.sender] += amount;
        donors.push(msg.sender);

        emit Donate(msg.sender, amount, block.timestamp);
    }

  /**
   * @dev releaseFunds releases funds to the owner of the contract.
   *
   * @param to owners address
   * @param amount amount denominated in ETH
   * Emits a {ReleaseFunds} event.
   */
    function releaseFunds(address to, uint256 amount) external {
        require(msg.sender == owner);
        payable(to).transfer(amount);

        emit ReleaseFunds(owner, amount, block.timestamp); 
    }

}