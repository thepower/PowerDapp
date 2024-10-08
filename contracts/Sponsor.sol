// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { ERC165 } from 'contracts/utils/introspection/ERC165.sol';
import 'contracts/GetTx.sol';

contract Sponsor is ERC165 {
  struct tpCall {
    string func;
    uint256[] args;
  }
  struct tpSig {
    bytes raw;
    uint256 timestamp;
    bytes pubkey;
    bytes rawkey;
    bytes signature;
  }
  struct tpTx1 {
    uint256 kind;
    address from;
    address to;
    uint256 t;
    uint256 seq;
    tpCall[] call;
    tpPayload[] payload;
    tpSig[] signatures;
  }
  struct tpTx {
    uint256 kind;
    address from;
    address to;
    uint256 t;
    uint256 seq;
    bytes call;
    //tpCall[] call;
    tpPayload[] payload;
    tpSig[] signatures;
  }
  struct tpPayload {
    uint256 purpose;
    string cur;
    uint256 amount;
  }

  bytes4 public constant INTERFACE_ID = bytes4(0x1B97712B);
  bytes4 public constant INTERFACE2_ID = bytes4(0xA44EFBE7);
  //sponsor_tx((uint256,address,address,uint256,uint256,bytes,(uint256,string,uint256)[],(bytes,uint256,bytes,bytes,bytes)[]))

  address public owner;
  mapping(address => uint) public allowed;

  constructor() {
    //INTERFACE_ID = this.areYouSponsor.selector ^ this.wouldYouLikeToPayTx.selector;
    //INTERFACE_ID = this.wouldYouLikeToPayTx.selector; =  0x1B97712B
    owner = msg.sender;
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC165) returns (bool) {
    return
      (interfaceId == INTERFACE_ID) ||
      (interfaceId == INTERFACE2_ID) ||
      super.supportsInterface(interfaceId);
  }

  function areYouSponsor() public pure returns (bool, bytes memory, uint256) {
    return (true, 'SK', 10000000);
  }

  function allowAdmin(address to) public returns (uint256) {
    require(
      msg.sender == owner || (allowed[msg.sender] & 0x100000000) == 0x100000000,
      'Not allowed'
    );
    return allowed[to] = allowed[to] | 0x100000000;
  }

  function allow(address to, uint32 add, uint32 del) public returns (uint256) {
    require(
      msg.sender == owner || (allowed[msg.sender] & 0x100000000) == 0x100000000,
      'Not allowed'
    );
    return allowed[to] = (allowed[to] & ~(uint(del))) | uint(add);
  }

  //new interface
  function sponsor_tx(
    GetTx.tpTx calldata utx
  ) public view returns (bool, GetTx.tpPayload[] memory pay) {
    if ((allowed[utx.from] & 1) == 0 && (allowed[utx.to] & 2) == 0) {
      uint256 rtype;
      bytes memory rres;
      (rtype, rres) = GetTx(address(0xAFFFFFFFFF000002)).getExtra('callcode');
      if (rtype == 2 && (rres.length == 8 || rres.length == 20)) {} else {
        return (false, new GetTx.tpPayload[](0));
      }
    }
    uint i = 0;
    uint found_fee_hint = 0;
    uint found_gas_hint = 0;
    for (i = 0; i < utx.payload.length; i++) {
      if (utx.payload[i].purpose == 33) {
        found_fee_hint = i + 1;
      }
      if (utx.payload[i].purpose == 35) {
        found_gas_hint = i + 1;
      }
    }

    uint c = 0;
    if (found_fee_hint > 0) c++;
    if (found_gas_hint > 0) c++;

    GetTx.tpPayload[] memory payload1 = new GetTx.tpPayload[](c);
    if (c == 2) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
      payload1[1] = utx.payload[found_gas_hint - 1];
      payload1[1].purpose = 3;
    } else if (c == 1 && found_gas_hint > 0) {
      payload1[0] = utx.payload[found_gas_hint - 1];
      payload1[0].purpose = 3;
    } else if (c == 1 && found_fee_hint > 0) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
    }
    return (true, payload1);
  }

  //This is old interface
  function wouldYouLikeToPayTx(
    tpTx1 calldata utx
  ) public view returns (string memory iWillPay, tpPayload[] memory pay) {
    if ((allowed[utx.from] & 1) == 0 && (allowed[utx.to] & 2) == 0) {
      return ('no', new tpPayload[](0));
    }
    uint i = 0;
    uint found_fee_hint = 0;
    uint found_gas_hint = 0;
    for (i = 0; i < utx.payload.length; i++) {
      if (utx.payload[i].purpose == 33) {
        found_fee_hint = i + 1;
      }
      if (utx.payload[i].purpose == 35) {
        found_gas_hint = i + 1;
      }
    }

    uint c = 0;
    if (found_fee_hint > 0) c++;
    if (found_gas_hint > 0) c++;

    tpPayload[] memory payload1 = new tpPayload[](c);
    if (c == 2) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
      payload1[1] = utx.payload[found_gas_hint - 1];
      payload1[1].purpose = 3;
    } else if (c == 1 && found_gas_hint > 0) {
      payload1[0] = utx.payload[found_gas_hint - 1];
      payload1[0].purpose = 3;
    } else if (c == 1 && found_fee_hint > 0) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
    }
    return ('i will pay', payload1);
  }

  function wouldYouLikeToPayTx(
    tpTx calldata utx
  ) public view returns (string memory iWillPay, tpPayload[] memory pay) {
    if ((allowed[utx.from] & 1) == 0 && (allowed[utx.to] & 2) == 0) {
      return ('no', new tpPayload[](0));
    }
    uint i = 0;
    uint found_fee_hint = 0;
    uint found_gas_hint = 0;
    for (i = 0; i < utx.payload.length; i++) {
      if (utx.payload[i].purpose == 33) {
        found_fee_hint = i + 1;
      }
      if (utx.payload[i].purpose == 35) {
        found_gas_hint = i + 1;
      }
    }

    uint c = 0;
    if (found_fee_hint > 0) c++;
    if (found_gas_hint > 0) c++;

    tpPayload[] memory payload1 = new tpPayload[](c);
    if (c == 2) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
      payload1[1] = utx.payload[found_gas_hint - 1];
      payload1[1].purpose = 3;
    } else if (c == 1 && found_gas_hint > 0) {
      payload1[0] = utx.payload[found_gas_hint - 1];
      payload1[0].purpose = 3;
    } else if (c == 1 && found_fee_hint > 0) {
      payload1[0] = utx.payload[found_fee_hint - 1];
      payload1[0].purpose = 1;
    }
    return ('i will pay', payload1);
  }
}
