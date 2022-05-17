import { RSKExplorerAPI } from '../../rskExplorerApi'
import type { Event } from '../../types/event'
import { PollingProvider } from '../AbstractPollingProvider'

export class TransactionProvider extends PollingProvider<Event> {
  private rskExplorerApi: RSKExplorerAPI

  constructor (address: string, rskExplorerApi : RSKExplorerAPI) {
    super(address)
    this.rskExplorerApi = rskExplorerApi
  }

  async getTransactionsPaginated (address: string, limit?: string, prev?: string, next?: string) {
    return this.rskExplorerApi.getTransactionsByAddress(address, limit, prev, next)
  }

  async poll () {
    const events = await this.getTransactionsPaginated(this.address)
      .then(transactions => transactions.data.map(transaction => ({ type: 'newTransaction', payload: transaction })))
      .catch(() => [])
    return events
  }
}
