import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor, borrower] = await ethers.getSigners();
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);
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
    
    await vault.connect(investor).fundLoan(borrower.address, 100000000);
    console.log(`Borrower asset token shares: ${await asset.connect(borrower).balanceOf(borrower.address)}`);
    console.log(`Vault asset token shares: ${await asset.connect(deployer).balanceOf(vault.address)}`);
}

main();
