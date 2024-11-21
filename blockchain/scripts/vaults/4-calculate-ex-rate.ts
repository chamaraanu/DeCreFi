import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";

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

    const asset = await ethers.getContractAt('Asset', addresses.asset);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);

    const vaultAssetBalance = await asset.balanceOf(addresses.investorVault)
    const ownerShareBalance = await vault.balanceOf(investor.address)

    const vaultAssetBalanceFloat = parseFloat(ethers.utils.formatUnits(vaultAssetBalance, 0));
    const ownerShareBalanceFloat = parseFloat(ethers.utils.formatUnits(ownerShareBalance, 0));

    const exRate = ownerShareBalanceFloat / vaultAssetBalanceFloat;

    console.log(`Vault asset balance is: ${vaultAssetBalance}`)
    console.log(`Owner share balance is: ${ownerShareBalance}`);
    console.log(`Ex Rate is: ${exRate}`)
}

main();