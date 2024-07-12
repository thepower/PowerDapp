import appEnvs from 'appEnvs';

export const profiles = {
  address: appEnvs.PROFILES_CONTRACT_ADDRESS,
  abi: [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    { inputs: [], name: 'AccessControlBadConfirmation', type: 'error' },
    {
      inputs: [
        { internalType: 'address', name: 'account', type: 'address' },
        { internalType: 'bytes32', name: 'neededRole', type: 'bytes32' }
      ],
      name: 'AccessControlUnauthorizedAccount',
      type: 'error'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32'
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'previousAdminRole',
          type: 'bytes32'
        },
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'newAdminRole',
          type: 'bytes32'
        }
      ],
      name: 'RoleAdminChanged',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'account',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        }
      ],
      name: 'RoleGranted',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'role',
          type: 'bytes32'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'account',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address'
        }
      ],
      name: 'RoleRevoked',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'key',
          type: 'uint256'
        }
      ],
      name: 'UserProfileChanged',
      type: 'event'
    },
    {
      inputs: [],
      name: 'ACC_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'ACC_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'DEFAULT_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'EDITOR_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'EDITOR_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'GEDITOR_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'GEDITOR_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'LOCKED_USER',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'REGISTERED',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'ROOT_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'USEREDIT_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'VERIFIED_USER',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'VERIFIER_ADMIN_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'VERIFIER_ROLE',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'uint256[]', name: 'keys', type: 'uint256[]' }
      ],
      name: 'getAddrProfileData',
      outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'userId', type: 'uint256' },
        { internalType: 'uint256[]', name: 'keys', type: 'uint256[]' }
      ],
      name: 'getProfileData',
      outputs: [{ internalType: 'bytes[]', name: '', type: 'bytes[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: 'userId', type: 'uint256' }],
      name: 'getRegisteredUser',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
      name: 'getRoleAdmin',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'addr', type: 'address' },
        { internalType: 'uint256', name: 'key', type: 'uint256' }
      ],
      name: 'getUserField',
      outputs: [{ internalType: 'bytes', name: 'value', type: 'bytes' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'role', type: 'bytes32' },
        { internalType: 'address', name: 'account', type: 'address' }
      ],
      name: 'grantRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'start', type: 'uint256' },
        {
          components: [
            { internalType: 'uint256', name: 'k', type: 'uint256' },
            { internalType: 'bytes', name: 'v', type: 'bytes' }
          ],
          internalType: 'struct UserProfile.kv[]',
          name: 'filters',
          type: 'tuple[]'
        },
        { internalType: 'bytes32[]', name: 'requiredroles', type: 'bytes32[]' },
        { internalType: 'bytes32[]', name: 'deniedroles', type: 'bytes32[]' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
        { internalType: 'bool', name: 'reverse', type: 'bool' }
      ],
      name: 'grep',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          components: [
            { internalType: 'uint256', name: 'k', type: 'uint256' },
            { internalType: 'bytes', name: 'v', type: 'bytes' }
          ],
          internalType: 'struct UserProfile.kv[]',
          name: 'filters',
          type: 'tuple[]'
        },
        { internalType: 'bytes32[]', name: 'requiredroles', type: 'bytes32[]' },
        { internalType: 'bytes32[]', name: 'deniedroles', type: 'bytes32[]' }
      ],
      name: 'grep_estimate',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'role', type: 'bytes32' },
        { internalType: 'address', name: 'account', type: 'address' }
      ],
      name: 'hasRole',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32[]', name: 'roles', type: 'bytes32[]' },
        { internalType: 'address', name: 'user', type: 'address' }
      ],
      name: 'hasRoles',
      outputs: [{ internalType: 'bool[]', name: '', type: 'bool[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          components: [
            { internalType: 'uint256', name: 'k', type: 'uint256' },
            { internalType: 'bytes', name: 'v', type: 'bytes' }
          ],
          internalType: 'struct UserProfile.kv[]',
          name: 'args',
          type: 'tuple[]'
        }
      ],
      name: 'quickReg',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'register',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'role', type: 'bytes32' },
        { internalType: 'address', name: 'callerConfirmation', type: 'address' }
      ],
      name: 'renounceRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'role', type: 'bytes32' },
        { internalType: 'address', name: 'account', type: 'address' }
      ],
      name: 'revokeRole',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'key', type: 'uint256' },
        { internalType: 'bytes', name: 'value', type: 'bytes' }
      ],
      name: 'setProfileField',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          components: [
            { internalType: 'uint256', name: 'k', type: 'uint256' },
            { internalType: 'bytes', name: 'v', type: 'bytes' }
          ],
          internalType: 'struct UserProfile.kv[]',
          name: 'args',
          type: 'tuple[]'
        }
      ],
      name: 'setProfileFields',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'bytes32', name: 'role', type: 'bytes32' },
        { internalType: 'bytes32', name: 'adminRole', type: 'bytes32' }
      ],
      name: 'setRoleAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        { internalType: 'uint256', name: 'key', type: 'uint256' },
        { internalType: 'bytes', name: 'value', type: 'bytes' }
      ],
      name: 'setUserProfileField',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: 'user', type: 'address' },
        {
          components: [
            { internalType: 'uint256', name: 'k', type: 'uint256' },
            { internalType: 'bytes', name: 'v', type: 'bytes' }
          ],
          internalType: 'struct UserProfile.kv[]',
          name: 'args',
          type: 'tuple[]'
        }
      ],
      name: 'setUserProfileFields',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
      name: 'supportsInterface',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
} as const;
