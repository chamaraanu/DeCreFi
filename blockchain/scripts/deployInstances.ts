import { DeployManager } from "../typechain-types";

export async function deployVaultInstance(
    deployManager: DeployManager,
    assetAddress: string,
    vaultName: string,
    vaultSymbol: string,
    adminAddress: string
): Promise<string> {

    // Deploy Vault using the deployManager contract
    let tx = await deployManager.deployVault({
        assetAddress: assetAddress,
        vaultName: vaultName,
        vaultSymbol: vaultSymbol,
        adminAddress: adminAddress
    });

    // Create a promise to resolve the deployed contract address
    const contractAddressPromise: Promise<string> = new Promise((resolve) => {
        // Define an event handler for VaultContractDeployed event
        const eventHandler = (
            vaultContractAddress: string,
        ) => {
            // Unsubscribe from the event and resolve the contract address
            deployManager.off('VaultContractDeployed', eventHandler);
            resolve(vaultContractAddress);
        };

        // Subscribe to VaultContractDeployed event
        deployManager.on('VaultContractDeployed', eventHandler);
    });

    // Wait for the contract address promise to resolve
    const contractAddress: string = await contractAddressPromise;
    await tx.wait();

    // Return the deployed Vault contract address
    return contractAddress;
}

export async function deployLoanInstance(
    deployManager: DeployManager,
    tokenName: string,
    tokenSymbol: string,
    baseUri: string,
    metadataUri: string,
    adminAddress: string
): Promise<string> {

    // Deploy Vault using the deployManager contract
    let tx = await deployManager.deployLoan({
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        baseUri: baseUri,
        metaDataUri: metadataUri,
        adminAddress: adminAddress
    });

    // Create a promise to resolve the deployed contract address
    const contractAddressPromise: Promise<string> = new Promise((resolve) => {
        // Define an event handler for LoanContractDeployed event
        const eventHandler = (
            loanContractAddress: string,
        ) => {
            // Unsubscribe from the event and resolve the contract address
            deployManager.off('LoanContractDeployed', eventHandler);
            resolve(loanContractAddress);
        };

        // Subscribe to VaultContractDeployed event
        deployManager.on('LoanContractDeployed', eventHandler);
    });

    // Wait for the contract address promise to resolve
    const contractAddress: string = await contractAddressPromise;
    await tx.wait();

    // Return the deployed Vault contract address
    return contractAddress;
}