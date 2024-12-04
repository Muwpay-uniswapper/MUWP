// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "forge-std/console2.sol";
import {MUWPTransfer} from "../src/MUWPTransfer.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

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
    address owner = makeAddr("owner");

    // Setup will run before each test
    function setUp() public {
        erc20Mock = new Mock(address(this));
        vm.prank(owner);
        muwpTransfer = new MUWPTransfer(owner);
        vm.deal(address(this), 10 ether);
        vm.deal(address(muwpTransfer), 1 ether); // Ensure the contract has some ETH
        
        console2.log("Contract owner:", muwpTransfer.owner());
        console2.log("Test contract address:", address(this));
        console2.log("Owner address:", owner);
        console2.log("MUWPTransfer contract balance:", address(muwpTransfer).balance);
    }

    function createSignature(address recipient) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(abi.encodePacked(recipient));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(keccak256(abi.encodePacked("owner"))), messageHash);
        return abi.encodePacked(r, s, v);
    }



    function test_SingleSenderTransfer() public {
        address[] memory senders = new address[](1);
        senders[0] = address(this);
        address[] memory tokens = new address[](1);
        tokens[0] = address(erc20Mock);
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;

        erc20Mock.mint(address(this), 100);
        erc20Mock.approve(address(muwpTransfer), 100);

        address recipient = makeAddr("carl");
        bytes memory signature = createSignature(recipient);

        uint256 gasAmount = 100000; // Reduced gas amount
        
        console2.log("Token balance before transfer:", erc20Mock.balanceOf(address(this)));
        console2.log("Token allowance before transfer:", erc20Mock.allowance(address(this), address(muwpTransfer)));
        console2.log("Sender:", address(this));
        console2.log("MUWPTransfer contract:", address(muwpTransfer));
        console2.log("Recipient:", recipient);
        console2.log("Gas amount:", gasAmount);
        
        // Debug signature
        bytes32 messageHash = keccak256(abi.encodePacked(recipient));
        console2.log("Message hash:");
        console2.logBytes32(messageHash);
        console2.log("Signature:");
        console2.logBytes(signature);
        
        // Extract r, s, v from signature
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        address recoveredSigner = ecrecover(messageHash, v, r, s);
        console2.log("Recovered signer:", recoveredSigner);
        console2.log("Expected signer (owner):", owner);

        vm.prank(owner);
        vm.deal(owner, gasAmount); // Ensure the owner has enough ETH to pay for gas
        try muwpTransfer.transfer{value: gasAmount}(senders, tokens, amounts, gasAmount, recipient, signature) {
            console2.log("Transfer completed successfully");
        } catch Error(string memory reason) {
            console2.log("Transfer failed with reason:", reason);
            revert(reason);
        } catch Panic(uint errorCode) {
            console2.log("Transfer failed with panic code:", errorCode);
            revert("Panic occurred");
        } catch (bytes memory lowLevelData) {
            console2.log("Transfer failed with low-level error");
            console2.logBytes(lowLevelData);
            revert("Low-level error");
        }

        console2.log("Sender balance after transfer:", erc20Mock.balanceOf(address(this)));
        console2.log("Recipient balance after transfer:", erc20Mock.balanceOf(recipient));

        assertEq(erc20Mock.balanceOf(address(this)), 0, "Balance should have been 0 after the transfer");
        assertEq(erc20Mock.balanceOf(recipient), 100, "Recipient should have received 100 tokens");
    }

    function test_MultipleSendersTransfer() public {
        address[] memory senders = new address[](3);
        senders[0] = address(this);
        senders[1] = alice;
        senders[2] = bob;

        address[] memory tokens = new address[](3);
        tokens[0] = address(0); // ETH
        tokens[1] = address(erc20Mock);
        tokens[2] = address(erc20Mock);

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1 ether;
        amounts[1] = 100;
        amounts[2] = 100;

        prepareMockTokens();

        address recipient = makeAddr("carl");
        bytes32 messageHash = keccak256(abi.encodePacked(recipient));
        bytes memory signature = createSignature(recipient);

        uint256 gasAmount = 20000 * (30 gwei);
        vm.deal(owner, 3 ether);
        vm.prank(owner);
        muwpTransfer.transfer{value: 1 ether + gasAmount}(senders, tokens, amounts, gasAmount, recipient, signature);

        assertEq(erc20Mock.balanceOf(alice), 0, "Alice's balance should be 0 after the transfer");
        assertEq(erc20Mock.balanceOf(bob), 0, "Bob's balance should be 0 after the transfer");
        assertEq(erc20Mock.balanceOf(recipient), 200, "Recipient should have received 200 tokens");
        assertEq(recipient.balance, 1 ether + gasAmount, "Recipient should have received 1 ether plus gas amount");
    }

    function prepareMockTokens() internal {
        erc20Mock.mint(alice, 100);
        vm.prank(alice);
        erc20Mock.approve(address(muwpTransfer), 100);

        erc20Mock.mint(bob, 100);
        vm.prank(bob);
        erc20Mock.approve(address(muwpTransfer), 100);
    }

    function test_PauseAndUnpause() public {
        vm.startPrank(owner);
        muwpTransfer.pause();

        address[] memory senders = new address[](1);
        address[] memory tokens = new address[](1);
        uint256[] memory amounts = new uint256[](1);

        vm.expectRevert(Pausable.EnforcedPause.selector);
        muwpTransfer.transfer(senders, tokens, amounts, 0, address(0), new bytes(65));

        muwpTransfer.unpause();

        address recipient = makeAddr("recipient");
        bytes memory signature = createSignature(recipient);

        // This should now succeed
        muwpTransfer.transfer(senders, tokens, amounts, 0, recipient, signature);
        vm.stopPrank();
    }


    receive() external payable {}
}
