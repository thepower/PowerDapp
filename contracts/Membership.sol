// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "contracts/token/ERC721/ERC721.sol";
import {IERC4906} from "contracts/interfaces/IERC4906.sol";
import {IERC165} from "contracts/interfaces/IERC165.sol";
import {Profiles} from "contracts/Profiles.sol";
import {ERC721Enumerable} from "contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "contracts/token/ERC721/extensions/ERC721Burnable.sol";

/// @title Membership Contract
/// @notice Manages membership tokens with subscription levels
contract Membership is IERC4906, ERC721, ERC721Enumerable, ERC721Burnable {
    mapping (uint256 => address) public minter;
    mapping (uint256 => mapping(uint8 => uint256)) public subscription;

    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721,
                                                                                ERC721Enumerable,
                                                                                IERC165) returns (bool) {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    uint8 public levels;
    uint256 private _nextTokenId;
    Profiles public rolesContract;
    bytes32 public ACCOUNTANT_ROLE;
    bytes32 public constant VERIFIED_USER = keccak256("VERIFIED_USER");

    /// @notice Constructor sets the roles contract and accountant role
    /// @param roles The address of the Profiles contract
    /// @param br_role The accountant role identifier
    constructor(address roles, bytes32 br_role) ERC721("Membership", "ISM") {
        rolesContract = Profiles(roles);
        levels=2;
        ACCOUNTANT_ROLE=br_role;
    }

    /// @notice Processes payment for a subscription
    /// @param tokenId The token ID
    /// @param level The subscription level
    /// @param period The subscription duration
    function payment_gw(uint256 tokenId, uint8 level, uint256 period) public {
        require(rolesContract.hasRole(ACCOUNTANT_ROLE, msg.sender), "permission denied");
        require(levels>=level, "bad level");
        for(uint8 i=level;i>0;i--){
            subscription[tokenId][i]= period + (
                subscription[tokenId][i]>block.timestamp
                    ?subscription[tokenId][i]:
                        block.timestamp
            );
        }
    }

    /// @notice Retrieves the membership level and expiration for a token
    /// @param tokenId The token ID
    /// @return level The current membership level
    /// @return expire The expiration timestamp
    function token_level(uint256 tokenId) public view returns (uint8 level,
                                                               uint256 expire) {
        if(tokenId>_nextTokenId)
            return(0,0);
        for(uint8 i=levels;i>0;i--){
            if(subscription[tokenId][i]>block.timestamp){
                return (i,subscription[tokenId][i]);
            }
        }
        return (0,0);
    }

    /// @notice Retrieves the highest membership level and expiration for a user
    /// @param account The user's address
    /// @return foundLevel The highest membership level
    /// @return foundExpire The expiration timestamp
    /// @return foundTokenId The token ID with the highest level
    function user_level(address account) public view returns (uint8 foundLevel,
                                                             uint256 foundExpire,
                                                             uint256 foundTokenId) {
        uint8 bestLevel=0;
        uint256 bestTime=0;
        uint256 bestTokenId=0;
        for(uint i=0;i<balanceOf(account);i++){
            uint256 itokenId=tokenOfOwnerByIndex(account,i);
            (uint8 level, uint256 time) = token_level(itokenId);
            if(level>bestLevel || bestTokenId==0){
                bestLevel=level;
                bestTime=time;
                bestTokenId=itokenId;
            }else if(level==bestLevel && time>bestTime){
                bestTime=time;
                bestTokenId=itokenId;
            }
        }
        return(bestLevel,bestTime,bestTokenId);
    }

    /// @notice Mints a new membership token for a user
    /// @param account The address to receive the token
    /// @return newTokenId The new token ID
    function mint(address account) public returns (uint256 newTokenId) {
        require(rolesContract.hasRole(VERIFIED_USER, msg.sender), "User not verified");
        uint256 tokenId = ++_nextTokenId;
        _mint(account, tokenId);
        minter[tokenId]=msg.sender;
        return tokenId;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
