import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployManager } from "../typechain-types";
import { DeployOnchainIDStruct } from "../typechain-types/contracts/DeployManager";
import { ethers } from "ethers";
const fs = require('fs');
const path = require('path');


export async function deployOnchainIdInstance(
    deployManager: DeployManager,
    admin: string
): Promise<string> {

    // Deploy ERC20 token using the deployManager contract
    let tx = await deployManager.deployOnchainIDIdentity({
        userWalletAddress: admin
    });

    // Create a promise to resolve the deployed contract address
    const contractAddressPromise: Promise<string> = new Promise((resolve) => {
        // Define an event handler for ERC20ContractDeployed event
        const eventHandler = (
            onchainIdContractAddress: string,
        ) => {
            // Unsubscribe from the event and resolve the contract address
            deployManager.off('OnchainIDContractDeployed', eventHandler);
            resolve(onchainIdContractAddress);
        };

        // Subscribe to ERC20ContractDeployed event
        deployManager.on('OnchainIDContractDeployed', eventHandler);
    });

    // Wait for the contract address promise to resolve
    const contractAddress: string = await contractAddressPromise;
    //await tx.wait();

    // Return the deployed ERC20 token contract address
    return contractAddress;
}

export async function deployERC3643Instance(
    deployManager: DeployManager,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimal: number,
    issuerOnchainId: string,
    signer: SignerWithAddress,
    trexImplementationAuthorityAddress: string,
    identityRegistryAddress: string,
    complianceAddress: string
): Promise<string> {

    const jsonFilePath = path.join(__dirname, '../artifacts/contracts/test/_t-rexContracts/proxy/TokenProxy.sol/TokenProxy.json');

    // Read and parse the JSON file
    const jsonString = fs.readFileSync(jsonFilePath, 'utf-8');
    const jsonData = JSON.parse(jsonString);

    const TokenProxyABI: ethers.ContractInterface = jsonData.abi;

    const TokenProxyBytecode = jsonData.bytecode;

    const TokenProxyFactory = new ethers.ContractFactory(TokenProxyABI, TokenProxyBytecode, signer);

    const tokenProxy = await TokenProxyFactory.deploy(
        trexImplementationAuthorityAddress,
        identityRegistryAddress,
        complianceAddress,
        tokenName,
        tokenSymbol,
        tokenDecimal,
        issuerOnchainId
    );

    // Wait for the deployment transaction to be mined
    await tokenProxy.deployed();

    // Return the deployed contract address
    return tokenProxy.address;
}
