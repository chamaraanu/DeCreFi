import { ethers, upgrades } from "hardhat";
import { deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor, originator] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    console.log("Originator address- ", originator.address);
    let addresses;

    try {
        addresses = await readJsonFromFile('./scripts/vaults/data.json');
        console.log('Data from file:', addresses);

    } catch (error) {
        console.error(error);
    }

    console.log(`Admin flow`);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);

    let tx, receipt, event;
    tx = await vault.connect(deployer).addInvestor(investor.address);
    receipt = await tx.wait();

    // Fetch the emitted `InvestorAdded` event
    event = receipt.events?.find(e => e.event === 'InvestorAdded');
    if (event) {
        const { vault: vaultAddress, user, timestamp, message } = event.args!;
        console.log(`InvestorAdded Event Details:`);
        console.log(`Vault Address: ${vaultAddress}`);
        console.log(`Investor Address: ${user}`);
        console.log(`Timestamp: ${timestamp}`);
        console.log(`Message: ${message}`);
    } else {
        console.error('InvestorAdded event not found in transaction receipt.');
    }

    tx = await vault.connect(deployer).addOriginator(originator.address);
    receipt = await tx.wait();

    // Fetch the emitted `OriginatorAdded` event
    event = receipt.events?.find(e => e.event === 'OriginatorAdded');
    if (event) {
        const { vault: vaultAddress, user, timestamp, message } = event.args!;
        console.log(`OriginatorAdded Event Details:`);
        console.log(`Vault Address: ${vaultAddress}`);
        console.log(`Originator Address: ${user}`);
        console.log(`Timestamp: ${timestamp}`);
        console.log(`Message: ${message}`);
    } else {
        console.error('OriginatorAdded event not found in transaction receipt.');
    }
}

main();
