import { VaultContractDeployed as VaultContractDeployedEvent } from "../generated/DeployManager/DeployManager"
import { VaultContractDeployed } from "../generated/schema"

export function handleVaultContractDeployed(
  event: VaultContractDeployedEvent
): void {
  let entity = new VaultContractDeployed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.vaultContractAddress = event.params.vaultContractAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
