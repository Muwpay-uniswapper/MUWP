// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MUWPTransfer {
    using SafeERC20 for IERC20;

    // Function to perform the bulk transfer.
    function transfer(
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalGas,
        address recipient
    ) public payable {
        require(
            tokens.length == amounts.length,
            "Arrays must be of equal length"
        );

        uint256 totalEthRequired = totalGas; // calculating the total ETH required for the transfer

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) {
                totalEthRequired += amounts[i];
            } else {
                IERC20 token = IERC20(tokens[i]);
                uint256 allowance = token.allowance(msg.sender, address(this));
                require(allowance >= amounts[i], "Not enough token allowance");
                token.safeTransferFrom(msg.sender, recipient, amounts[i]);
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
