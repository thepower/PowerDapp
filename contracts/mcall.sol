// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Multicall Contract
/// @notice Allows executing multiple contract calls in a single transaction
contract multicall {
    /// @notice Structure representing a contract call
    struct cd {
        address to;
        bytes data;
    }

    /// @notice Executes multiple contract calls
    /// @param args An array of contract calls
    /// @return A status code
    function mcall(cd[] calldata args) public returns (uint256) {
        for(uint i=0;i<args.length;i++){
            (bool success,) = address(args[i].to).call(args[i].data);
            require(success,"call unsuccessfull");
        }
        return 1;
    }
}
