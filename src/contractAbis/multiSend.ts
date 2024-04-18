export const multiSend = {
  abi: [
    {
      inputs: [
        {
          components: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
          ],
          internalType: 'struct multicall.cd[]',
          name: 'args',
          type: 'tuple[]',
        },
      ],
      name: 'mcall',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  code: '0x608060405234801561000F575F80FD5B5060043610610029575F3560E01C80632EBBE3D41461002D575B5F80FD5B61004061003B36600461017E565B610052565B60405190815260200160405180910390F35B5F805B82811015610174575F848483818110610070576100706101ED565B90506020028101906100829190610201565B61009090602081019061021F565B6001600160A01B03168585848181106100AB576100AB6101ED565B90506020028101906100BD9190610201565B6100CB90602081019061024C565B6040516100D9929190610296565B5F604051808303815F865AF19150503D805F8114610112576040519150601F19603F3D011682016040523D82523D5F602084013E610117565B606091505B50509050806101615760405162461BCD60E51B815260206004820152601260248201527118D85B1B081D5B9CDD58D8D95CDCD99D5B1B60721B604482015260640160405180910390FD5B508061016C816102A5565B915050610055565B5060019392505050565B5F806020838503121561018F575F80FD5B823567FFFFFFFFFFFFFFFF808211156101A6575F80FD5B818501915085601F8301126101B9575F80FD5B8135818111156101C7575F80FD5B8660208260051B85010111156101DB575F80FD5B60209290920196919550909350505050565B634E487B7160E01B5F52603260045260245FFD5B5F8235603E19833603018112610215575F80FD5B9190910192915050565B5F6020828403121561022F575F80FD5B81356001600160A01B0381168114610245575F80FD5B9392505050565B5F808335601E19843603018112610261575F80FD5B83018035915067FFFFFFFFFFFFFFFF82111561027B575F80FD5B60200191503681900382131561028F575F80FD5B9250929050565B818382375F9101908152919050565B5F600182016102C257634E487B7160E01B5F52601160045260245FFD5B506001019056',
} as const;