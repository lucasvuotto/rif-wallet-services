import _axios from 'axios'
import { DataSource } from '../repository/DataSource'
import {
  BalanceServerResponse, BlockResponse, InternalTransaction, ServerResponse, TokenBalanceServerResponse,
  TokenServerResponse, TokenTransferApi, TransactionResponse
} from './types'
import {
  fromApiToInternalTransaction, fromApiToRtbcBalance, fromApiToTEvents,
  fromApiToTokenWithBalance, fromApiToTokens, fromApiToTransaction
} from './utils'

export class BlockscoutAPI extends DataSource {
  private chainId: number
  private errorHandling = (e) => {
    console.error(e)
    return []
  }

  constructor (apiURL: string, chainId: number, axios: typeof _axios, id: string) {
    super(apiURL, id, axios)
    this.chainId = chainId
  }

  getBlockNumberByTimestamp (timestamp: number, timeDirection: string) {
    const params = {
      module: 'block',
      action: 'getblocknobytime',
      timestamp,
      closest: timeDirection
    }
    return this.axios?.get<ServerResponse<BlockResponse>>(this.url, { params })
      .then(response => response.data.result.blockNumber)
      .catch(() => '0')
  }

  getTokens () {
    return this.axios?.get<TokenServerResponse>(`${this.url}/v2/tokens`)
      .then(response => response.data.items
        .map(token => fromApiToTokens(token, this.chainId)))
      .catch(this.errorHandling)
  }

  async getTokensByAddress (address: string) {
    return this.axios?.get<TokenBalanceServerResponse[]>(
      `${this.url}/v2/addresses/${address.toLowerCase()}/token-balances`
    )
      .then(response => response.data.filter(t => t.token.name != null)
        .map(token => {
          token.token.value = token.value
          return fromApiToTokenWithBalance(token.token, this.chainId)
        }))
      .catch(this.errorHandling)
  }

  getRbtcBalanceByAddress (address: string) {
    return this.axios?.get<BalanceServerResponse>(`${this.url}/v2/addresses/${address.toLowerCase()}`)
      .then(response => fromApiToRtbcBalance(response.data.coin_balance, this.chainId))
      .catch(this.errorHandling)
  }

  async getEventsByAddress (address: string, limit?: string, startBlock?: number, endBlock?: number) {
    const params = {
      module: 'account',
      action: 'tokentx',
      address: address.toLowerCase(),
      ...(startBlock && { startblock: startBlock }),
      ...(endBlock && { endblock: endBlock })
    }
    return this.axios?.get<ServerResponse<TokenTransferApi[]>>(`${this.url}`, { params })
      .then(response =>
        response.data.result
          .map(tokenTranfer => {
            return fromApiToTEvents(tokenTranfer)
          }))
      .catch(this.errorHandling)
  }

  getTransaction (hash: string) {
    const params = {
      module: 'transaction',
      action: 'gettxinfo',
      txhash: hash
    }
    return this.axios?.get<ServerResponse<TransactionResponse>>(`${this.url}`, { params })
      .then(response =>
        fromApiToTransaction(response.data.result))
      .catch(this.errorHandling)
  }

  getInternalTransactionByAddress (address: string, limit?: string, startBlock?: number, endBlock?: number) {
    const params = {
      module: 'account',
      action: 'txlistinternal',
      address,
      ...(startBlock && { startblock: startBlock }),
      ...(endBlock && { endblock: endBlock })
    }
    return this.axios?.get<ServerResponse<InternalTransaction[]>>(this.url, { params })
      .then(response => response.data.result.map(fromApiToInternalTransaction))
      .catch(this.errorHandling)
  }

  getTransactionsByAddress (address: string, limit?: string,
    prev?: string,
    next?: string,
    blockNumber?: string,
    startTimestamp?: number,
    endTimestamp?: number) {
    const params = {
      module: 'account',
      action: 'txlist',
      startblock: blockNumber,
      address: address.toLowerCase(),
      ...(startTimestamp && { start_timestamp: startTimestamp }),
      ...(endTimestamp && { end_timestamp: endTimestamp })
    }
    return this.axios?.get<ServerResponse<TransactionResponse[]>>(
      `${this.url}`, { params }
    )
      .then(response => ({ data: response.data.result.map(fromApiToTransaction) }))
      .catch(this.errorHandling)
  }
}
