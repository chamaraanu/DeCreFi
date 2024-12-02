import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";
import { formatUnits, parseUnits } from "ethers/lib/utils";

async function main() {
    let [deployer, investor, originator, borrower] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
    console.log("Originator address- ", originator.address);
    console.log("Borrower address- ", borrower.address);
    let addresses;

    try {
        addresses = await readJsonFromFile('./scripts/vaults/data.json');
        console.log('Data from file:', addresses);

    } catch (error) {
        console.error(error);
    }

    console.log(`Borrow flow`);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);
    // test functions 
    const name = await vault.connect(investor).name();
    console.log(`Name is: ${name}`);
    const setAsset = await vault.connect(investor).asset();
    console.log(`Asset is: ${setAsset}`);

    const asset = await ethers.getContractAt('Asset', addresses.asset);
    let tx, receipt, event;
    tx = await vault.connect(originator).fundLoan(borrower.address, parseUnits('100', 6));
    receipt = await tx.wait();

    // Fetch the emitted `LoanFunded` event
    event = receipt.events?.find(e => e.event === 'LoanFunded');
    if (event) {
        const { vault: vaultAddress, originator, borrower, assets } = event.args!;
        console.log(`LoanFunded Event Details:`);
        console.log(`Vault Address: ${vaultAddress}`);
        console.log(`Originator Address: ${originator}`);
        console.log(`From Address: ${borrower}`);
        console.log(`Assets: ${assets}`);
    } else {
        console.error('LoanFunded event not found in transaction receipt.');
    }

    console.log(`Borrower asset token balance: ${formatUnits(await asset.connect(borrower).balanceOf(borrower.address), 6)}`);
    console.log(`Vault asset token balance: ${formatUnits(await asset.connect(deployer).balanceOf(vault.address), 6)}`);
}

main();
