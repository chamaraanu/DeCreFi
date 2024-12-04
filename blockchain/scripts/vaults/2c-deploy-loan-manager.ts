import { ethers, upgrades } from "hardhat";
import { deployLoanInstance, deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor, originator, borrower] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    let addresses;

    try {
        addresses = await readJsonFromFile('./scripts/vaults/data.json');
        console.log('Data from file:', addresses);

    } catch (error) {
        console.error(error);
    }

    const LoanManager = await ethers.getContractFactory("LoanManager");
    const loanManagerDeployer = LoanManager.connect(deployer);

    // Deploy the LoanManager proxy using deployer
    const loanManager = await upgrades.deployProxy(
        loanManagerDeployer, 
        [
            addresses.loanToken, 
            addresses.investorVault,
            originator.address
        ], 
        { initializer: 'initialize' }
    );
    await loanManager.deployed();
    console.log(`Loan Manager: ${loanManager.address}`);

    const loan = await ethers.getContractAt('Loan', addresses.loanToken);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);

    const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
    await loan.grantRole(MINTER_ROLE, loanManager.address);

    const ORIGINATOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORIGINATOR_ROLE"));
    await vault.grantRole(ORIGINATOR_ROLE, loanManager.address);

    const newData = {
        loanManager: loanManager.address
    };

    try {
        await appendJsonToFile('./scripts/vaults/data.json', newData);
        console.log('JSON data successfully appended to file.');
    } catch (error) {
        console.error(error);
    }
}

main();
