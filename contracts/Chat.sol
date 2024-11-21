// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LStore {
	function setByPath(bytes[] calldata,uint256,bytes calldata) public virtual returns (uint256) {}
}

/// @title Chat Contract
/// @notice Allows users to register messages in a chat system
contract Chat {
	mapping(uint => uint) public chatCounters;
	LStore private lstore=LStore(address(0xAFFFFFFFFF000005));

	event textbin(string text,bytes data);

	constructor() {
	}

	/// @notice Registers a message in the chat
	/// @param id The chat ID
	/// @param message The message content
	function registerMessage(uint256 id, string memory message) public  {
		bytes[] memory path = new bytes[](3);
		path[0] = toBytes(id);//id
		path[1] = toBytes(chatCounters[id]);//number of meessage
		chatCounters[id]++;
		path[2] = bytes('acc');//index of meessage

		bytes[] memory pathCounter = new bytes[](2);
		pathCounter[0] = path[0];//id
		pathCounter[1] = bytes("count");//index of counter

		bytes memory acc = toBytes(uint256(uint160(msg.sender)));

		bytes memory message_bin = bytes(message);
		bytes memory count  = toBytes(chatCounters[id]);

		require(lstore.setByPath(pathCounter,1,count)==1,"can't set lstore");
		require(lstore.setByPath(path,1,acc)==1,"can't set lstore");
		path[2] = bytes('msg');//index of message
		require(lstore.setByPath(path,1,message_bin)==1,"can't set lstore");
	}

	/// @notice Converts a uint256 to bytes
	/// @param x The uint256 value
	/// @return b The bytes representation
	function toBytes(uint256 x) public pure returns (bytes memory b) {
		if (x==0) {
			return new bytes (1);	
		}
		uint l = 32;

		if (x < 0x100000000000000000000000000000000) { x <<= 128; l -= 16; }
		if (x < 0x1000000000000000000000000000000000000000000000000) { x <<= 64; l -= 8; }
		if (x < 0x100000000000000000000000000000000000000000000000000000000) { x <<= 32; l -= 4; }
		if (x < 0x1000000000000000000000000000000000000000000000000000000000000) { x <<= 16; l -= 2; }
		if (x < 0x100000000000000000000000000000000000000000000000000000000000000) { x <<= 8; l -= 1; }
		if (x < 0x100000000000000000000000000000000000000000000000000000000000000) { x <<= 8; l -= 1; }

		b = new bytes (l);

		assembly { mstore(add(b, 32), x) }
	}

	/// @notice Retrieves the message count for a chat
	/// @param id The chat ID
	/// @return counter The number of messages
	function getChatCounters(uint id) public view returns(uint counter) {
		return chatCounters[id];
	}
}
