// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MUWPTransfer.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        
        MUWPTransfer transferContract = new MUWPTransfer(0xB532588d7173F3c0749A04DF75BF14552aF21Df4);
        
        vm.stopBroadcast();
    }
}
