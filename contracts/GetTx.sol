// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title GetTx Contract
/// @notice Provides structures and functions to access transaction data
contract GetTx {
  /// @notice Structure representing a transaction
  struct tpTx {
    uint256 kind;
    address from;
    address to;
    uint256 t;
    uint256 seq;
    bytes call;
    tpPayload[] payload;
    tpSig[] signatures;
  }

  /// @notice Structure representing a transaction payload
  struct tpPayload {
    uint256 purpose;
    string cur;
    uint256 amount;
  }

  /// @notice Structure representing a signature
  struct tpSig {
    bytes raw;
    uint256 timestamp;
    bytes pubkey;
    bytes rawkey;
    bytes signature;
  }

  /// @notice Retrieves the current transaction data
  /// @return The transaction data
  function getTx() public view virtual returns (tpTx memory) {}

  /// @notice Retrieves extra data associated with the transaction
  /// @param keyname The name of the key
  /// @return A tuple containing the type and data
  function getExtra(
    string calldata keyname
  ) public view virtual returns (uint256, bytes memory) {}

  /// @notice Retrieves the signers of the transaction
  /// @return An array of signers' data
  function getSigners() public view virtual returns (bytes[] memory) {}
}
