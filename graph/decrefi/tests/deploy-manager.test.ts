import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { VaultContractDeployed } from "../generated/schema"
import { VaultContractDeployed as VaultContractDeployedEvent } from "../generated/DeployManager/DeployManager"
import { handleVaultContractDeployed } from "../src/deploy-manager"
import { createVaultContractDeployedEvent } from "./deploy-manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let vaultContractAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newVaultContractDeployedEvent =
      createVaultContractDeployedEvent(vaultContractAddress)
    handleVaultContractDeployed(newVaultContractDeployedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("VaultContractDeployed created and stored", () => {
    assert.entityCount("VaultContractDeployed", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "VaultContractDeployed",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "vaultContractAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
