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

    constructor() {
        owner = msg.sender;
        // totalAmount = 0;
    }

    /** **** View Functions ****  */

    /**
     * @dev getDonors returns array of donors addresses
     *
     */
    function getDonors() external view returns (address[] memory) {
        return donors;
    }

    function getTotalAmout() external view returns (uint256) {
        return totalAmount;
    }

    /** **** State Changing External Functions **** */

    /**
     * @dev donate accepts funds as a payment and records its sender and amount it received
     *
     * Emits a {Donate} event.
     */
    function donate() external payable {
        uint256 amount = msg.value;
        require(amount > 0, "donation is 0");

        if (amounts[msg.sender] == 0) {
            donors.push(msg.sender);
        }

        amounts[msg.sender] += amount;
        totalAmount += amount;

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
        require(msg.sender == owner, "only ownwer");

        require(to != address(0), "address 0");

        require(totalAmount >= amount, "amount insufficient");

        payable(to).transfer(amount);
        totalAmount -= amount;

        emit ReleaseFunds(owner, amount);
    }
}
