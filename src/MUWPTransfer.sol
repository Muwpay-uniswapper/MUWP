// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract MUWPTransfer is Ownable, Pausable {
    using SafeERC20 for IERC20;

    constructor() Ownable(msg.sender) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function transfer(
        address[] calldata senders,
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint256 totalGas,
        address recipient,
        bytes memory signature
    ) 
        public 
        payable 
        whenNotPaused
    {
        require(
            tokens.length == amounts.length && 
            senders.length == tokens.length, 
            "Arrays must be of equal length"
        );

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(recipient));
        require(SignatureChecker.isValidSignatureNow(owner(), messageHash, signature), "Invalid signature");

        uint256 totalEthRequired = totalGas;

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(0)) {
                totalEthRequired += amounts[i];
            } else {
                IERC20(tokens[i]).safeTransferFrom(senders[i], recipient, amounts[i]);
            }
        }

        require(totalEthRequired <= msg.value, "Not enough ETH sent");
        if (totalEthRequired != 0) {
            (bool success, ) = recipient.call{value: totalEthRequired}("");
            require(success, "Transfer of ETH failed");
        }
    
        uint256 ethToRefund = msg.value - totalEthRequired;
        if (ethToRefund != 0) {
            (bool success, ) = msg.sender.call{value: ethToRefund}("");
            require(success, "Refund of ETH failed");
        }
    }
}