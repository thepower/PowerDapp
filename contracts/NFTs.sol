// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "contracts/token/ERC721/ERC721.sol";
import {IERC4906} from "contracts/interfaces/IERC4906.sol";
import {IERC165} from "contracts/interfaces/IERC165.sol";
import {Profiles} from "contracts/Profiles.sol";
import {ERC721Enumerable} from "contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "contracts/token/ERC721/extensions/ERC721Burnable.sol";
/*
Attributes
  language = 1,
  theme = 2,
  category = 3,
  description = 4,
  walletAddress = 5,
  createdAt = 6,
  updatedAt = 7,
  imageHash = 8,
  articleHash = 9,
  filesHash = 10,
  isApproved = 11,
  isRejected = 12,
  nameOfOrganizationSlug = 13,
  publishedAt = 4097,
  originContract = 4098,
  origintTokenId = 4099,

 */

/// @title IndexArticles2 Contract
/// @notice Manages indexed articles as ERC721 tokens
contract IndexArticles2 is IERC4906, ERC721, ERC721Enumerable, ERC721Burnable {
    mapping (uint256 => mapping(uint256 => bytes)) public nftData;

    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721,
                                                                                ERC721Enumerable,
                                                                                IERC165) returns (bool) {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    Profiles public rolesContract;
    bytes32 public adminRole;
    //bytes32 public constant GEDITOR_ROLE = keccak256("GEDITOR_ROLE");

    string public data_storage;
    uint256 public maxId;

    /// @notice Constructor sets the roles contract and admin role
    /// @param roles The address of the Profiles contract
    /// @param newAdminRole The admin role identifier
    constructor(address roles, bytes32 newAdminRole) ERC721("Article index", "Aidx") {
        rolesContract = Profiles(roles);
        adminRole = newAdminRole;
    }
    struct kv {
        uint256 k;
        bytes v;
    }

    /// @notice Mints a new indexed article token
    /// @param newToken The new token ID (0 to auto-increment)
    /// @param originERC721 The original ERC721 contract address
    /// @param rTokenId The token ID in the original contract
    /// @param keys The data keys to copy
    /// @return The new token ID
    function mint(uint256 newToken, address originERC721, uint256 rTokenId, uint256[] calldata keys) public returns (uint256) {
        require(rolesContract.hasRole(adminRole, msg.sender), "Permission denied");
        Article origin=Article(originERC721);
        if(newToken==0){
            maxId++;
            newToken=maxId;
        }
        address from = _ownerOf(newToken);
        require(from==address(0) || from==origin.ownerOf(rTokenId), "Owner mismatch");
        if(from == address(0)){
            _mint(origin.ownerOf(rTokenId), newToken);
            _setCustomField(newToken,4097,toBytes(block.timestamp));
            _setCustomField(newToken,4098,toBytes(uint160(originERC721)));
            _setCustomField(newToken,4099,toBytes(rTokenId));
        }
        for(uint i=0;i<keys.length;i++){
            _setCustomField(newToken,keys[i],origin.nftData(rTokenId,keys[i]));
        }
        emit MetadataUpdate(newToken);
        return newToken;
    }
    function toBytes(uint256 x) internal pure returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }
    function delCustomField(uint256 tokenId, uint256 key) public {
        require(rolesContract.hasRole(adminRole, msg.sender), "Permission denied");
        delete nftData[tokenId][key];
    }
    function _setCustomField(uint256 tokenId,
                             uint256 key,
                             bytes memory value) internal {
        nftData[tokenId][key]=value;
    }
    function _match(uint256 tokenId,
                    kv[] calldata flt) internal view returns (bool) {
        for (uint i=0;i<flt.length;i++){
            if(nftData[tokenId][flt[i].k].length!=flt[i].v.length)
                return false;
            if(keccak256(nftData[tokenId][flt[i].k])!=keccak256(flt[i].v))
                return false;
        }
        return true;
    }
    function getNftData(uint256 tokenId, uint256[] memory keys) public view returns (bytes[] memory) {
        bytes[] memory x = new bytes[](keys.length);
        for(uint i=0;i<keys.length;i++){
            x[i]=nftData[tokenId][keys[i]];
        }
        return x;
    }
    function grep_estimate(kv[] calldata filters) public view returns (uint256) {
            uint i=0;
            uint found=0;
            while(i++<=maxId){
                if(_ownerOf(i) != address(0) && _match(i,filters)){
                    found++;
                }
            }
            return found;
    }

    /// @notice Greps tokens matching specific filters
    /// @param start The starting token ID
    /// @param filters Key-value filters to match
    /// @param amount The maximum number of results
    /// @param reverse Whether to search in reverse
    /// @return An array of matching token IDs
    function grep(uint256 start,
                  kv[] calldata filters,
                  uint256 amount,
                  bool reverse) public view returns (uint256[] memory) {
            uint256[] memory x = new uint256[](amount);

            uint i=start;
            if(start==0) start=1;
            uint found=0;
            while(found<amount){
                if(i==0 && reverse) break;
                if(_ownerOf(i) != address(0) && _match(i,filters)){
                    x[found]=i;
                    found++;
                }
                if(i>=maxId && !reverse) break;
                if(reverse) i--; else i++;
            }
            return x;
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

/// @title Article Contract
/// @notice Manages articles as ERC721 tokens
contract Article is IERC4906, ERC721, ERC721Enumerable, ERC721Burnable {
    mapping (uint256 => mapping(uint256 => bytes)) public nftData;

    bytes4 private constant ERC4906_INTERFACE_ID = bytes4(0x49064906);
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721,
                                                                                ERC721Enumerable,
                                                                                IERC165) returns (bool) {
        return interfaceId == ERC4906_INTERFACE_ID || super.supportsInterface(interfaceId);
    }

    uint256 private _nextTokenId;
    Profiles public rolesContract;
    bytes32 public constant VERIFIED_USER = keccak256("VERIFIED_USER");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    string public data_storage;

    /// @notice Constructor sets the roles contract
    /// @param roles The address of the Profiles contract
    constructor(address roles) ERC721("Article", "ATCL") {
        rolesContract = Profiles(roles);
    }
    event SetStorage(string data_storage);
    function setStorage(string calldata new_storage) public {
        require(rolesContract.hasRole(EDITOR_ROLE, msg.sender), "denied");
        data_storage = new_storage;
        emit SetStorage(new_storage);
    }
    struct kv {
        uint256 k;
        bytes v;
    }

    /// @notice Mints a new article token
    /// @param player The address to receive the token
    /// @param args Key-value pairs of article data
    /// @return The new token ID
    function mint(address player, kv[] calldata args) public returns (uint256) {
        //require(rolesContract.hasRole(VERIFIED_USER, msg.sender), "User not verified");
        uint256 tokenId = ++_nextTokenId;
        _mint(player, tokenId);
        for(uint i=0;i<args.length;i++){
            _setCustomField(tokenId,args[i].k,args[i].v);
        }
        emit MetadataUpdate(tokenId);
        return tokenId;
    }

    /// @notice Sets data fields for an existing token
    /// @param tokenId The token ID
    /// @param args Key-value pairs of data to set
    /// @return The token ID
    function setData(uint256 tokenId, kv[] calldata args) public returns (uint256) {
        require(
            _isAuthorized(_ownerOf(tokenId), msg.sender, tokenId) ||
            rolesContract.hasRole(EDITOR_ROLE, msg.sender),
            "denied");
        for(uint i=0;i<args.length;i++){
            _setCustomField(tokenId,args[i].k,args[i].v);
        }
        emit MetadataUpdate(tokenId);
        return tokenId;
    }
    function _setCustomField(uint256 tokenId,
                             uint256 key,
                             bytes memory value) internal {
        nftData[tokenId][key]=value;
    }
    function _match(uint256 tokenId,
                    kv[] calldata flt) internal view returns (bool) {
        for (uint i=0;i<flt.length;i++){
            if(nftData[tokenId][flt[i].k].length!=flt[i].v.length)
                return false;
            if(keccak256(nftData[tokenId][flt[i].k])!=keccak256(flt[i].v))
                return false;
        }
        return true;
    }
    function getNftData(uint256 tokenId, uint256[] memory keys) public view returns (bytes[] memory) {
        bytes[] memory x = new bytes[](keys.length);
        for(uint i=0;i<keys.length;i++){
            x[i]=nftData[tokenId][keys[i]];
        }
        return x;
    }
    function grep_estimate(kv[] calldata filters) public view returns (uint256) {
            uint i=0;
            uint found=0;
            while(i<_nextTokenId){
                if(_match(i,filters)){
                    found++;
                }
                i++;
            }
            return found;
    }

    /// @notice Greps tokens matching specific filters
    /// @param start The starting token ID
    /// @param filters Key-value filters to match
    /// @param amount The maximum number of results
    /// @param reverse Whether to search in reverse
    /// @return An array of matching token IDs
    function grep(uint256 start,
                  kv[] calldata filters,
                  uint256 amount,
                  bool reverse) public view returns (uint256[] memory) {
            uint256[] memory x = new uint256[](amount);

            uint i=start;
            uint found=0;
            while(found<amount){
                if(_match(i,filters)){
                    x[found]=i;
                    found++;
                }
                if(i==0 && reverse) break;
                if(i==_nextTokenId && !reverse) break;
                if(reverse) i--; else i++;
            }
            return x;
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
