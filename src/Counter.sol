// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MUWPTransfer {
    // Function to perform the bulk transfer.
    function transfer(
        address[] memory tokens,
        uint256[] memory amounts,
        address recipient
    ) public payable {
        require(
            tokens.length == amounts.length,
            "Arrays must be of equal length"
        );

        uint256 totalEthRequired = 0;

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) {
                totalEthRequired += amounts[i];
            } else {
                IERC20 token = IERC20(tokens[i]);
                uint256 balance = token.balanceOf(address(this));
                require(balance >= amounts[i], "Not enough token balance");
                token.approve(recipient, amounts[i]);
                require(
                    token.transfer(recipient, amounts[i]),
                    "Token transfer failed"
                );
            }
        }

        // checking if ETH amount to transfer is less than or equals to the msg.value (ETH being sent)
        require(totalEthRequired <= msg.value, "Not enough ETH sent");

        // transferring the appropriate ETH value to recipient
        (bool success, ) = recipient.call{value: totalEthRequired}("");
        require(success, "Transfer of ETH failed");

        // refunding the remaining ETH if any to the msg.sender
        uint256 ethToRefund = msg.value - totalEthRequired;
        if (ethToRefund > 0) {
            (success, ) = msg.sender.call{value: ethToRefund}("");
            require(success, "Refund of ETH failed");
        }
    }
}
