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

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    // Setup will run before each test
    function setUp() public {
        erc20Mock = new Mock(address(this));
        muwpTransfer = new MUWPTransfer();
        hoax(address(this), 10 ether);
    }

    function test_SingleSenderTransfer() public {
        // Define sender, token and amount arrays.
        address[] memory senders = new address[](1);
        senders[0] = address(this);
        address[] memory tokens = new address[](1);
        tokens[0] = address(erc20Mock);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;

        // Ensure MUWPTransfer contract has enough tokens
        erc20Mock.mint(address(this), 100);
        erc20Mock.approve(address(muwpTransfer), 100);

        // Perform the transfer.
        uint256 gas = 20000 * (30 gwei);
        muwpTransfer.transfer{value: gas}(senders, tokens, amounts, gas, makeAddr("carl"));

        uint256 remainingBalance = erc20Mock.balanceOf(address(this));

        // Verify results
        assertEq(
            remainingBalance,
            0,
            "Balance should have been 0 after the transfer"
        );
    }

    function test_MultipleSendersTransfer() public {
        // Define sender, token and amount arrays.
        address[] memory senders = new address[](3);
        senders[0] = address(this);
        senders[1] = alice;
        senders[2] = bob;

        address[] memory tokens = new address[](3);
        tokens[0] = address(0); // ETH
        tokens[1] = address(erc20Mock); // Mock token
        tokens[2] = address(erc20Mock); // Mock token

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1 ether; // ETH
        amounts[1] = 100;     // Mock token
        amounts[2] = 100; // Mock token

        console2.log("Alice's balance before minting: ", erc20Mock.balanceOf(alice));
        // Ensure MUWPTransfer contract has enough tokens for Alice and Bob
        erc20Mock.mint(alice, 100);
        vm.prank(alice); // Make Alice the caller
        erc20Mock.approve(address(muwpTransfer), 100);
        vm.prank(address(this)); // Set the "caller" back to address(this)

        console2.log("Bob's balance before minting: ", erc20Mock.balanceOf(bob));

        erc20Mock.mint(bob, 100);
        vm.prank(bob); // Make Bob the caller
        erc20Mock.approve(address(muwpTransfer), 100);

        // Perform the transfer.
        vm.prank(address(this)); // Set the "caller" back to address(this)
        uint256 gas = 20000 * (30 gwei);

        uint256 balance = address(this).balance;

        muwpTransfer.transfer{value: 2 ether}(senders, tokens, amounts, gas, makeAddr("carl"));

        // Verify results for Mock token transfers
        assertEq(
            erc20Mock.balanceOf(alice),
            0,
            "Alice's balance should be 0 after the Mock token transfer"
        );
        assertEq(
            erc20Mock.balanceOf(bob),
            0,
            "Bob's balance should be 0 after the Mock token transfer"
        );
    }

    receive() external payable {}
}
