import _axios from 'axios'
import { ethers } from 'ethers'
import BitcoinCore from '../service/bitcoin/BitcoinCore'

export abstract class DataSource {
  readonly url: string
  readonly id: string
  readonly axios?: typeof _axios

  constructor (url: string, id: string, axios?: typeof _axios) {
    this.url = url
    this.id = id
    this.axios = axios
  }

  abstract getTokens();
  abstract getBlockNumberByTimestamp(timestamp: number, timeDirection: string);
  abstract getTokensByAddress(address: string);
  abstract getRbtcBalanceByAddress(address: string);
  abstract getEventsByAddress(address: string, limit?: string, startBlock?: number, endBlock?: number);
  abstract getTransaction(hash: string);
  abstract getInternalTransactionByAddress(address: string, limit?: string, startBlock?: number, endBlock?: number);
  abstract getTransactionsByAddress(address:string,
    limit?: string,
    prev?: string,
    next?: string,
    blockNumber?: string,
    startTimestamp?: number,
    endTimestamp?: number,
  );
}

export type RSKDatasource = {
  [key: string] : DataSource
}

export type RSKNodeProvider = {
  [key: string] : ethers.providers.JsonRpcProvider
}

export type BitcoinDatasource = {
  [key: string] : BitcoinCore
}
