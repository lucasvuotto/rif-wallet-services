import cors from 'cors'
import { Application, NextFunction, Request, Response, Express } from 'express'
import { PricesQueryParams } from '../api/types'
import { registeredDapps } from '../registered_dapps'
import { errorHandler } from '../middleware'
import { BitcoinDatasource, RSKDatasource } from '../repository/DataSource'
import swaggerUI from 'swagger-ui-express'
import OpenApi from '../api/openapi'
import BitcoinRouter from '../service/bitcoin/BitcoinRouter'
import { ValidationError, object, string } from 'yup'
import { utils } from 'ethers'
import { AddressService } from '../service/address/AddressService'
import { supportedFiat } from '../coinmarketcap/support'
import { Flow } from '../types/event'

interface HttpsAPIDependencies {
  app: Express,
  dataSourceMapping: RSKDatasource,
  bitcoinMapping: BitcoinDatasource,
  addressService: AddressService
}

export class HttpsAPI {
  private app: Application
  private dataSourceMapping: RSKDatasource
  private bitcoinMapping: BitcoinDatasource
  private addressService: AddressService
  constructor (dependencies: HttpsAPIDependencies) {
    this.app = dependencies.app
    this.dataSourceMapping = dependencies.dataSourceMapping
    this.bitcoinMapping = dependencies.bitcoinMapping
    this.addressService = dependencies.addressService
  }

  responseJsonOk (res: Response) {
    return res.status(200).json.bind(res)
  }

  handleValidationError (e, res: Response) : void {
    if (e instanceof ValidationError) {
      res.status(400).json({ errors: e.errors })
    } else {
      throw e
    }
  }

  init () : void {
    const addressSchema = object({
      address: string().required('An address is invalid')
        .trim()
        .transform(address => utils.isAddress(address.toLowerCase()) ? address : '')
    })
    const schema = object({
      chainId: string().optional()
        .trim()
        .oneOf(Object.keys(this.dataSourceMapping), 'The current chainId is not supported'),
      convert: string().optional()
        .trim()
        .oneOf(supportedFiat, 'The current currency is not supported'),
      flow: string().optional()
        .trim()
        .oneOf([Flow.ALL, Flow.FROM, Flow.TO], 'The transaction filter is invalid')
    })

    const whilelist = [
      'https://dapp.testnet.dao.rif.technology',
      'https://dapp.mainnet.dao.rif.technology',
      'https://rif-wallet-services.testnet.rifcomputing.net',
      'https://dao-backend.testnet.rifcomputing.net',
      'https://frontend.testnet.dao.rif.technology'
    ]
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || whilelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by cors'))
        }
      }
    }))

    this.app.get('/tokens', ({ query: { chainId = '31' } }: Request, res: Response, next: NextFunction) => {
      try {
        schema.validateSync({ chainId })
        return this
          .dataSourceMapping[chainId as string].getTokens()
          .then(this.responseJsonOk(res))
          .catch(next)
      } catch (e) {
        this.handleValidationError(e, res)
      }
    })

    this.app.get(
      '/address/:address/tokens',
      async ({ params: { address }, query: { chainId = '31' } }: Request, res: Response, next: NextFunction) => {
        try {
          addressSchema.validateSync({ address })
          schema.validateSync({ chainId })
          const balance = await this.addressService.getTokensByAddress({
            chainId: chainId as string,
            address: address as string
          }).catch(next)
          return this.responseJsonOk(res)(balance)
        } catch (e) {
          this.handleValidationError(e, res)
        }
      }
    )

    this.app.get(
      '/address/:address/events',
      ({ params: { address }, query: { chainId = '31' } }: Request, res: Response, next: NextFunction) => {
        try {
          addressSchema.validateSync({ address })
          schema.validateSync({ chainId })
          return this
            .dataSourceMapping[chainId as string].getEventsByAddress(address)
            .then(this.responseJsonOk(res))
            .catch(next)
        } catch (e) {
          this.handleValidationError(e, res)
        }
      }
    )

    this.app.get(
      '/address/:address/transactions',
      async ({
        params: { address },
        query: { limit, prev, next, chainId = '31', blockNumber = '0', flow = Flow.ALL }
      }: Request,
      res: Response, nextFunction: NextFunction) => {
        try {
          addressSchema.validateSync({ address })
          schema.validateSync({ chainId, flow })

          const transactions = await this.addressService.getTransactionsByAddress({
            address: address as string,
            chainId: chainId as string,
            limit: limit as string,
            prev: prev as string,
            next: next as string,
            blockNumber: blockNumber as string,
            flow: flow as Flow
          }).catch(nextFunction)
          return this.responseJsonOk(res)(transactions)
        } catch (e) {
          this.handleValidationError(e, res)
        }
      }
    )

    this.app.get('/nfts/:address',
      async ({ params: { address }, query: { chainId = '31' } } : Request, res: Response,
        nextFunction: NextFunction) => {
        try {
          schema.validateSync({ chainId })
          addressSchema.validateSync({ address })
          const nft = await this.addressService.getNftInfo({ chainId: chainId as string, address }).catch(nextFunction)
          return this.responseJsonOk(res)(nft)
        } catch (e) {
          this.handleValidationError(e, res)
        }
      })

    this.app.get('/address/:address/nfts/:nft',
      async ({ params: { nft, address }, query: { chainId = '31' } } : Request, res: Response,
        nextFunction: NextFunction) => {
        try {
          schema.validateSync({ chainId })
          addressSchema.validateSync({ address })
          const nftInfo = await this.addressService
            .getNftOwnedByAddress({ chainId: chainId as string, address, nftAddress: nft })
            .catch(nextFunction)
          return this.responseJsonOk(res)(nftInfo)
        } catch (e) {
          this.handleValidationError(e, res)
        }
      })

    this.app.get(
      '/price',
      async (req: Request<{}, {}, {}, PricesQueryParams>, res: Response) => {
        try {
          const { convert = 'USD', addresses = '' } = req.query
          schema.validateSync({ convert })
          addresses.split(',').forEach(address => addressSchema.validateSync({ address }))
          const prices = await this.addressService.getPrices({
            addresses,
            convert
          })
          return this.responseJsonOk(res)(prices)
        } catch (error) {
          this.handleValidationError(error, res)
        }
      }
    )

    this.app.get(
      '/latestPrices',
      async (req, res, next: NextFunction) => {
        try {
          const prices = await this.addressService.getLatestPrices()
          return this.responseJsonOk(res)(prices)
        } catch (error) {
          next(error)
        }
      }
    )

    this.app.get(
      '/address/:address',
      async (req, res) => {
        try {
          const { limit, prev, next, chainId = '31', blockNumber = '0', flow = Flow.ALL } = req.query
          const { address } = req.params
          addressSchema.validateSync({ address })
          schema.validateSync({ chainId })
          const data = await this.addressService.getAddressDetails({
            chainId: chainId as string,
            address,
            blockNumber: blockNumber as string,
            limit: limit as string,
            prev: prev as string,
            next: next as string,
            flow: flow as Flow
          })
          return this.responseJsonOk(res)(data)
        } catch (error) {
          this.handleValidationError(error, res)
        }
      }
    )

    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(OpenApi))
    this.app.use('/bitcoin', BitcoinRouter(this.responseJsonOk, this.bitcoinMapping))
    this.app.get('/dapps', (_: Request, res: Response) => this.responseJsonOk(res)(registeredDapps))

    this.app.use(errorHandler)
  }
}
