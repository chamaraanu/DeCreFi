import { ethers, upgrades } from "hardhat";
import { deployLoanInstance, deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    let addresses;

    try {
        addresses = await readJsonFromFile('./scripts/vaults/data.json');
        console.log('Data from file:', addresses);

    } catch (error) {
        console.error(error);
    }

    // Connect to DeployManager
    const DeployManager = await ethers.getContractFactory("DeployManager");
    const deployManager = await DeployManager.connect(deployer).attach(addresses.deployManager);
    console.log(`deploymanager ${deployManager.address}`)

    // Deploy vault
    let loanToken = await deployLoanInstance(
        deployManager,
        "Loan Token",
        "LT",
        "https://gateway.pinata.cloud/ipfs/",
        "https://gateway.pinata.cloud/ipfs/metadata",
        deployer.address
    );
    console.log(`Loan Token deployed at ${loanToken}`);

    // Connect to Vault
    const Loan = await ethers.getContractFactory("Loan");
    const loan = await Loan.connect(deployer).attach(loanToken);

    // let tx;
    // tx = await vault.connect(deployer).addInvestor(investor.address);
    // await tx.wait();

    const newData = {
        loanToken: loanToken
    };

    try {
        await appendJsonToFile('./scripts/vaults/data.json', newData);
        console.log('JSON data successfully appended to file.');
    } catch (error) {
        console.error(error);
    }
}

main();
