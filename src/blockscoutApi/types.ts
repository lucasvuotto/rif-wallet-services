import { IToken } from './utils'

export interface Token {
  address: string
  circulating_market_cap: string
  decimals: string
  exchange_rate: string
  holders: string
  icon_url: string
  name: string
  symbol: string
  total_supply: string
  type: string
  value: string
}
export interface NextPageParams {
  contract_address_hash?: string
  holder_count?: number
  is_name_null?: boolean
  items_count?: number
  market_cap?: string
  name?: string
  block_number?: number
  fee?: string
  hash?: string
  index?: number
  inserted_at?: string
  value?: string
}

export interface IApiToken {
  name: string
  symbol: string
  decimals: string
  address: string
}

export interface ITokenWithBalance extends IToken {
  balance: string
}

export enum TokenType {
  ERC20 = 'ERC-20',
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155'
}

export interface TokenServerResponse {
  items: Token[]
  next_page_params: NextPageParams
}

export interface TokenBalanceServerResponse {
  token: Token
  token_id: any
  token_instance: any
  value: string
}

export interface Account {
  ens_domain_name: any
  hash: string
  implementation_name: any
  is_contract: boolean
  is_verified: any
  name: any
  private_tags: any[]
  public_tags: any[]
  watchlist_names: any[]
}

export interface Total {
  decimals: string
  value: string
}

export interface TokenTransfer {
  block_hash: string
  from: Account
  log_index: string
  method: string
  timestamp: string
  to: Account
  token: Token
  total: Total
  tx_hash: string
  type: string
}

export interface TokenTransferServerResponse {
  items: TokenTransfer[]
  next_page_params: NextPageParams
}

export interface Fee {
  type: string
  value: string
}

export interface Parameter {
  name: string
  type: string
  value: string
}

export interface DecodedInput {
  method_call: string
  method_id: string
  parameters: Parameter[]
}

export interface InternalTransaction {
  blockNumber: string
  callType: string
  contractAddress: string
  errCode: string
  from: string
  gas: string
  gasUsed: string
  index: string
  input: string
  isError: string
  timeStamp: string
  to: string
  transactionHash: string
  type: string
  value: string
}

export interface TransactionResponse {
  blockHash: string
  blockNumber: string
  confirmations: string
  contractAddress: string
  cumulativeGasUsed: string
  from: string
  gas: string
  gasPrice: string
  gasUsed: string
  hash: string
  input: string
  isError: string
  nonce: string
  timeStamp: string
  to: string
  transactionIndex: string
  txreceipt_status: string
  value: string
}

export interface BlockResponse {
  blockNumber: string
}

export interface BalanceServerResponse {
  block_number_balance_updated_at: number
  coin_balance: string
  creation_tx_hash: any
  creator_address_hash: any
  ens_domain_name: any
  exchange_rate: any
  has_beacon_chain_withdrawals: boolean
  has_custom_methods_read: boolean
  has_custom_methods_write: boolean
  has_decompiled_code: boolean
  has_logs: boolean
  has_methods_read: boolean
  has_methods_read_proxy: boolean
  has_methods_write: boolean
  has_methods_write_proxy: boolean
  has_token_transfers: boolean
  has_tokens: boolean
  has_validated_blocks: boolean
  hash: string
  implementation_address: any
  implementation_name: any
  is_contract: boolean
  is_verified: any
  name: any
  private_tags: any[]
  public_tags: any[]
  token: any
  watchlist_address_id: any
  watchlist_names: any[]
}

export interface InternalTransactionResponse {
  items: InternalTransaction[],
  next_page_params: NextPageParams
}

export interface TokenTransferApi {
  value: string
  blockHash: string
  blockNumber: string
  confirmations: string
  contractAddress: string
  cumulativeGasUsed: string
  from: string
  gas: string
  gasPrice: string
  gasUsed: string
  hash: string
  input: string
  logIndex: string
  nonce: string
  timeStamp: string
  to: string
  tokenDecimal: string
  tokenName: string
  tokenSymbol: string
  transactionIndex: string
}

export interface ServerResponse<T> {
  message: string
  status: string
  result: T
}
