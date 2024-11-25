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

    const vault = await ethers.getContractAt('Vault', addresses.investorVault);

    const name = await vault.connect(investor).name();
    console.log(`Name is: ${name}`);
    const setAsset = await vault.connect(investor).asset();
    console.log(`Asset is: ${setAsset}`);

    console.log(`Decimals: ${await vault.connect(investor).decimals()}`)
    console.log(`Preview Deposit: ${parseFloat(ethers.utils.formatUnits(await vault.connect(investor).previewDeposit(100000000), 6))}`)
    console.log(`Preview Mint: ${parseFloat(ethers.utils.formatUnits(await vault.connect(investor).previewMint(100000000), 6))}`)
    console.log(`Preview Withdraw: ${parseFloat(ethers.utils.formatUnits(await vault.connect(investor).previewWithdraw(100000000), 6))}`)
    console.log(`Preview Redeem: ${parseFloat(ethers.utils.formatUnits(await vault.connect(investor).previewRedeem(100000000), 6))}`)
}

main();
