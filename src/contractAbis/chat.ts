import appEnvs from 'appEnvs';

export const chat = {
  address: appEnvs.CHAT_CONTRACT_ADDRESS,
  abi: [
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'string',
          name: 'text',
          type: 'string'
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'data',
          type: 'bytes'
        }
      ],
      name: 'textbin',
      type: 'event'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      name: 'chatCounters',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'id',
          type: 'uint256'
        }
      ],
      name: 'getChatCounters',
      outputs: [
        {
          internalType: 'uint256',
          name: 'counter',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'id',
          type: 'uint256'
        },
        {
          internalType: 'string',
          name: 'message',
          type: 'string'
        }
      ],
      name: 'registerMessage',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'string',
          name: 's',
          type: 'string'
        }
      ],
      name: 'string_tobytes',
      outputs: [
        {
          internalType: 'bytes',
          name: '',
          type: 'bytes'
        }
      ],
      stateMutability: 'pure',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'x',
          type: 'uint256'
        }
      ],
      name: 'toBytes',
      outputs: [
        {
          internalType: 'bytes',
          name: 'b',
          type: 'bytes'
        }
      ],
      stateMutability: 'pure',
      type: 'function'
    }
  ]
} as const;
