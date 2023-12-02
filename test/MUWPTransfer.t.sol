// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";
import {MUWPTransfer} from "../src/MUWPTransfer.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Mock is ERC20, Ownable {
    constructor(
        address initialOwner
    ) ERC20("Mock", "MCK") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract MUWPTransferTest is Test {
    MUWPTransfer public muwpTransfer;

    // Mock ERC20 Token
    Mock public erc20Mock;

    // address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    // Setup will run before each test
    function setUp() public {
        // hoax(alice, 1 ether);
        erc20Mock = new Mock(address(this));
        muwpTransfer = new MUWPTransfer();
        hoax(address(this), 1 ether);
    }

    function test_Transfer() public {
        // Define token and amount arrays.
        address[] memory tokens = new address[](1);
        tokens[0] = address(erc20Mock);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;

        // Ensure MUWPTransfer contract has enough tokens
        erc20Mock.mint(address(this), 100);
        erc20Mock.approve(address(muwpTransfer), 100);

        console2.log("MUWPTransfer address: %s", address(muwpTransfer));
        console2.log(
            "MUWPTransfer balance: %s",
            erc20Mock.balanceOf(address(this))
        );

        // Perform the transfer.
        uint256 gas = 20000 * (30 gwei);
        muwpTransfer.transfer{value: gas}(tokens, amounts, gas, bob);

        uint256 remainingBalance = erc20Mock.balanceOf(address(this));

        // Verify results
        assertEq(
            remainingBalance,
            0,
            "Balance should have been 0 after the transfer"
        );
        // Check ETH balance of the receiver
        assertEq(
            address(bob).balance,
            gas,
            "ETH balance of the receiver should be gas"
        );
    }
}
