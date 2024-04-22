// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract multicall {
    struct cd {
        address to;
        bytes data;
    }
    function mcall(cd[] calldata args) public returns (uint256) {
        for(uint i=0;i<args.length;i++){
            (bool success,) = address(args[i].to).call(args[i].data);
            require(success,"call unsuccessfull");
        }
        return 1;
    }
}
