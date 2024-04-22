// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "contracts/access/AccessControl.sol";

contract UserProfile {
    mapping (address => mapping( uint256 => bytes)) private userProfile;
    event UserProfileChanged(address indexed user, uint256 indexed key);
    function _setUserField(address addr, uint256 key, bytes calldata value) internal {
        emit UserProfileChanged(addr,key);
        userProfile[addr][key]=value;
    }
    function getUserField(address addr, uint256 key) public view returns (bytes memory value) {
        return userProfile[addr][key];
    }
    struct kv {
        uint256 k;
        bytes v;
    }
    function _match(address user, kv[] calldata flt) internal view returns (bool) {
        for (uint i=0;i<flt.length;i++){
            if(userProfile[user][flt[i].k].length!=flt[i].v.length)
                return false;
            if(keccak256(userProfile[user][flt[i].k])!=keccak256(flt[i].v))
                return false;
        }
        return true;
    }

}

contract Profiles is UserProfile, AccessControl {
    bytes32 public constant VERIFIED_USER = keccak256("VERIFIED_USER");
    bytes32 public constant LOCKED_USER = keccak256("LOCKED_USER");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant VERIFIER_ADMIN_ROLE = keccak256("VERIFIER_ADMIN_ROLE");
    bytes32 public constant ROOT_ADMIN_ROLE = keccak256("ROOT_ADMIN_ROLE");
    bytes32 public constant USEREDIT_ROLE = keccak256("USEREDIT_ROLE");

    bytes32 public constant EDITOR_ADMIN_ROLE = keccak256("EDITOR_ADMIN_ROLE");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    bytes32 public constant GEDITOR_ADMIN_ROLE = keccak256("GEDITOR_ADMIN_ROLE");
    bytes32 public constant GEDITOR_ROLE = keccak256("GEDITOR_ROLE");

    bytes32 public constant ACC_ADMIN_ROLE = keccak256("ACC_ADMIN_ROLE");
    bytes32 public constant ACC_ROLE = keccak256("ACC_ROLE");

    bytes32 public constant REGISTERED = keccak256("REGISTERED");

    address[] private registeredUsers;
    address[] private verifiedUsers;

    //struct kv { uint256 k; bytes v; }

    constructor() {
        _grantRole(ROOT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ROOT_ADMIN_ROLE, ROOT_ADMIN_ROLE);

        _setRoleAdmin(VERIFIER_ADMIN_ROLE, ROOT_ADMIN_ROLE);
        _setRoleAdmin(VERIFIER_ROLE, VERIFIER_ADMIN_ROLE);
        _setRoleAdmin(VERIFIED_USER, VERIFIER_ROLE);
        _setRoleAdmin(LOCKED_USER, VERIFIER_ROLE);

        _setRoleAdmin(EDITOR_ADMIN_ROLE, ROOT_ADMIN_ROLE);
        _setRoleAdmin(EDITOR_ROLE, EDITOR_ADMIN_ROLE);

        _setRoleAdmin(GEDITOR_ADMIN_ROLE, ROOT_ADMIN_ROLE);
        _setRoleAdmin(GEDITOR_ROLE, GEDITOR_ADMIN_ROLE);

        _setRoleAdmin(ACC_ADMIN_ROLE, ROOT_ADMIN_ROLE);
        _setRoleAdmin(ACC_ROLE, ACC_ADMIN_ROLE);
    }

    function register() public {
        require(false==hasRole(REGISTERED, msg.sender), "User already registered");
        _grantRole(REGISTERED, msg.sender);
        _grantRole(VERIFIED_USER, msg.sender);
        registeredUsers.push(msg.sender);
    }

    function hasRoles(bytes32[] memory roles, address user) public view returns (bool[] memory){
        bool[] memory x = new bool[](roles.length);
        for (uint i=0;i<roles.length;i++){
            x[i]=hasRole(roles[i], user);
        }
        return x;
    }

    function _matchRoles(address user, bytes32[] memory roles) internal view returns (bool){
        for (uint i=0;i<roles.length;i++){
            if(!hasRole(roles[i], user))
                return false;
        }
        return true;
    }

    function _matchNoRoles(address user, bytes32[] memory roles) internal view returns (bool){
        for (uint i=0;i<roles.length;i++){
            if(hasRole(roles[i], user))
                return false;
        }
        return true;
    }

    function getAddrProfileData(address user, uint256[] memory keys) public view returns (bytes[] memory) {
        bytes[] memory x = new bytes[](keys.length);
        for(uint i=0;i<keys.length;i++){
            x[i]=getUserField(user, keys[i]);
        }
        return x;
    }

    function getProfileData(uint256 userId, uint256[] memory keys) public view returns (bytes[] memory) {
        //offset in 1
        return getAddrProfileData (registeredUsers[userId-1], keys);
    }
    function getRegisteredUser(uint256 userId) public view returns (address) {
        //offset in 1
        return registeredUsers[userId-1];
    }
    function totalSupply() public view returns (uint256) {
        return registeredUsers.length;
    }

    function grep_estimate(
        kv[] calldata filters,
        bytes32[] calldata requiredroles,
        bytes32[] calldata deniedroles
    ) public view returns (uint256) {
        uint found=0;
        for(uint i=0; i<registeredUsers.length; i++){
            //if(i>=registeredUsers.length) break;
            if(
                _matchRoles(registeredUsers[i],requiredroles) &&
                    _matchNoRoles(registeredUsers[i],deniedroles) &&
                        _match(registeredUsers[i],filters)
            ){
                found++;
            }
            //i++;
        }
        return found;
    }

    function grep(uint256 start,
                  kv[] calldata filters,
                  bytes32[] calldata requiredroles,
                  bytes32[] calldata deniedroles,
                  uint256 amount,
                  bool reverse) public view returns (uint256[] memory) {
                      uint256[] memory x = new uint256[](amount);
                      uint i=start;
                      if(i>0) i--;
                      uint found=0;
                      while(found<amount){
                          if(i>=registeredUsers.length && !reverse) break;
                          if(
                              _matchRoles(registeredUsers[i],requiredroles) &&
                                  _matchNoRoles(registeredUsers[i],deniedroles) &&
                                      _match(registeredUsers[i],filters)
                          ){
                              //offset in 1
                              x[found]=i+1;
                              found++;
                          }
                          if(i==0 && reverse) break;
                          if(reverse) i--; else i++;
                      }
                      return x;
                  }

    //function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role))
    //function renounceRole(bytes32 role, address callerConfirmation) public virtual 

    function setRoleAdmin(bytes32 role, bytes32 adminRole) public onlyRole(ROOT_ADMIN_ROLE) {
        _setRoleAdmin(role, adminRole);
    }

    function setProfileField(uint256 key, bytes calldata value) public {
        //require(hasRole(VERIFIED_USER, msg.sender)==false, "Profile verified");
        require(hasRole(REGISTERED, msg.sender), "Unknown user");
        _setUserField(msg.sender, key, value);
    }

    function setProfileFields(kv[] calldata args) public returns (uint256) {
        //require(hasRole(VERIFIED_USER, msg.sender)==false, "Profile verified");
        require(hasRole(REGISTERED, msg.sender), "Unknown user");
        for(uint i=0;i<args.length;i++){
            _setUserField(msg.sender, args[i].k, args[i].v);
        }
        return 1;
    }

    
    function setUserProfileField(address user, uint256 key, bytes calldata value) public onlyRole(VERIFIER_ROLE) {
        require(hasRole(REGISTERED, user), "Unknown user");
        _setUserField(user, key, value);
    }

    function setUserProfileFields(address user, kv[] calldata args) public onlyRole(VERIFIER_ROLE) {
        require(hasRole(REGISTERED, user), "Unknown user");
        for(uint i=0;i<args.length;i++){
            _setUserField(user, args[i].k,args[i].v);
        }
    }

    function quickReg(kv[] calldata args) public returns (uint256) {
        register();
        for(uint i=0;i<args.length;i++){
            _setUserField(msg.sender, args[i].k,args[i].v);
        }
        return 1;
    }
}
