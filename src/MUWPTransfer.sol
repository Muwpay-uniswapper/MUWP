// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract MUWPTransfer is Context {
    using SafeERC20 for IERC20;

    function transfer(
        address[] memory senders,
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalGas,
        address recipient
    ) 
        public 
        payable 
    {
        require(
            tokens.length == amounts.length && 
            senders.length == tokens.length, 
            "Arrays must be of equal length"
        );

        uint256 totalEthRequired = totalGas;

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) {
                totalEthRequired += amounts[i];
            } else {
                IERC20 token = IERC20(tokens[i]);
                uint256 allowance = token.allowance(senders[i], address(this));
                require(allowance >= amounts[i], "Not enough token allowance");
                token.safeTransferFrom(senders[i], recipient, amounts[i]);
            }
        }

        require(totalEthRequired <= msg.value, "Not enough ETH sent");

        (bool success, ) = recipient.call{value: totalEthRequired}("");
        require(success, "Transfer of ETH failed");

        uint256 ethToRefund = msg.value - totalEthRequired;
        if (ethToRefund > 0) {
            (success, ) = _msgSender().call{value: ethToRefund}("");
            require(success, "Refund of ETH failed");
        }
    }
}