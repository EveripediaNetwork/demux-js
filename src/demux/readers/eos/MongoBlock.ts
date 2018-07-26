import { EosAction } from "./interfaces"
import { Block } from "../../../../index"

export default class MongoBlock implements Block {
  public actions: EosAction[]
  public blockHash: string
  public blockNumber: number
  public previousBlockHash: string
  constructor(rawBlock: any, blockState: any) {
    this.actions = this.collectActionsFromBlock(rawBlock)
    this.blockNumber = blockState.block_num
    this.blockHash = blockState.block_id
    this.previousBlockHash = blockState.block_header_state.header.previous
  }

  protected collectActionsFromBlock(rawBlock: any = { actions: [] }): EosAction[] {
    return this.flattenArray(rawBlock.map((trx: any) => {
      return trx.actions.map((action: any, actionIndex: number) => {
        // Delete unneeded hex data if we have deserialized data
        if (action.data) {
          delete action.hex_data // eslint-disable-line
        }

        return {
          type: `${action.account}::${action.name}`,
          payload: {
            transactionId: rawBlock.trx_id,
            actionIndex,
            ...action,
          },
        }
      })
    }))
  }

  private flattenArray(arr: any[]): any[] {
    return arr.reduce((flat, toFlatten) =>
      flat.concat(Array.isArray(toFlatten) ? this.flattenArray(toFlatten) : toFlatten), [])
  }
}
