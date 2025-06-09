import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as process from 'node:process';

@Injectable()
export class VrfService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  private readonly abi = [
    {
      inputs: [
        { internalType: 'uint256', name: 'subscriptionId', type: 'uint256' },
        { internalType: 'bytes32', name: '_keyHash', type: 'bytes32' },
        { internalType: 'address', name: 'vrfCoordinator', type: 'address' },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'requestId',
          type: 'uint256',
        },
      ],
      name: 'RequestSent',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'requestId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'randomWord',
          type: 'uint256',
        },
      ],
      name: 'RequestFulfilled',
      type: 'event',
    },
    {
      inputs: [],
      name: 'getLastRandomNumber',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'bool', name: 'nativePayment', type: 'bool' }],
      name: 'requestRandomNumber',
      outputs: [
        { internalType: 'uint256', name: 'requestId', type: 'uint256' },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'keyHash',
      outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'lastRequestId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 's_randomRange',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 's_subscriptionId',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  constructor() {
    const rpcUrl = process.env.RPC_URL!;
    const privateKey = process.env.PRIVATE_KEY!;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async requestRandom(
    nativePayment: boolean = false,
    isMega: boolean = false,
  ): Promise<ethers.TransactionResponse> {
    const contractAddress = isMega
      ? process.env.VRF_MEGA
      : process.env.VRF_CONTRACT;
    const contract = new ethers.Contract(
      contractAddress as string,
      this.abi,
      this.wallet,
    );
    const tx: ethers.TransactionResponse =
      await contract.requestRandomNumber(nativePayment);
    return tx;
  }
}
