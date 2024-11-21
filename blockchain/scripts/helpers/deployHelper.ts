import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

/**
 * Deploy an upgradable proxy contract using the specified logic contract and arguments.
 * @param contractName - Name of the logic contract to deploy as an upgradable proxy.
 * @param args - Arguments required for initializing the logic contract.
 * @param signer - Signer with address used for deploying the contract.
 * @returns The address of the deployed upgradable proxy contract.
 */
export async function deployUpgradableProxy(
    contractName: string,
    args: any[],
    signer: SignerWithAddress
): Promise<string> {
    const LogicContract = await ethers.getContractFactory(contractName);
    const contract = await upgrades.deployProxy(
        LogicContract.connect(signer),
        args,
        {
            kind: "uups",
        }
    );
    return contract.address;
}

/**
 * Deploy an implementation contract for upgradability
 * @param contractName - Name of the contract to deploy as an implementation.
 * @param signer - Signer with address used for deploying the contract.
 * @returns The address of the deployed implementation contract.
 */
export async function deployImplementation(contractName: string, signer: SignerWithAddress): Promise<string> {
    const LogicContract = await ethers.getContractFactory(contractName);
    const contractInstance = <string>(
        await upgrades.deployImplementation(LogicContract)
    );
    return contractInstance;
}