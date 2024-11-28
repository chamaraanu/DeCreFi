import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";
import { formatUnits, parseUnits } from "ethers/lib/utils";

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

    console.log(`Deposit flow`);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);
    // test functions 
    const name = await vault.connect(investor).name();
    console.log(`Name is: ${name}`);
    const setAsset = await vault.connect(investor).asset();
    console.log(`Asset is: ${setAsset}`);

    const asset = await ethers.getContractAt('Asset', addresses.asset);
    
    let tx;
    tx = await asset.connect(investor).approve(vault.address, parseUnits('100', 6));
    await tx.wait();
    console.log(`Asset approval done`);
    tx = await vault.connect(investor).deposit(parseUnits('100', 6), investor.address);
    await tx.wait();
    console.log(`Investor vault token shares: ${formatUnits(await vault.connect(investor).balanceOf(investor.address), 6)}`);

}

main();
