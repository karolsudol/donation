// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Donation {
    address public owner;
    mapping(address => uint256) public amounts;

    constructor () {
        owner = msg.sender;
    }

    function donate() external payable {
        uint256 amount = msg.value;

        amounts[msg.sender] += amount;
    }

    function releaseFunds(address to, uint256 amount) external {
        require(msg.sender == owner);

        payable(to).transfer(amount);
    }
}