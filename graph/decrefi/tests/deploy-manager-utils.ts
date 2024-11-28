import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { VaultContractDeployed } from "../generated/DeployManager/DeployManager"

export function createVaultContractDeployedEvent(
  vaultContractAddress: Address
): VaultContractDeployed {
  let vaultContractDeployedEvent = changetype<VaultContractDeployed>(
    newMockEvent()
  )

  vaultContractDeployedEvent.parameters = new Array()

  vaultContractDeployedEvent.parameters.push(
    new ethereum.EventParam(
      "vaultContractAddress",
      ethereum.Value.fromAddress(vaultContractAddress)
    )
  )

  return vaultContractDeployedEvent
}
