import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";
import { formatUnits, parseUnits } from "ethers/lib/utils";

async function main() {
    let [deployer, investor, originator] = await ethers.getSigners();
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
    let tx, receipt, event;
    tx = await asset.connect(originator).approve(vault.address, parseUnits('10', 6));
    await tx.wait();
    console.log(`Asset approval done`);
    tx = await vault.connect(originator).depositYield(originator.address, parseUnits('10', 6));
    receipt = await tx.wait();

    // Fetch the emitted `YeildDeposited` event
    event = receipt.events?.find(e => e.event === 'YeildDeposited');
    if (event) {
        const { vault: vaultAddress, originator, fromAddress, assets } = event.args!;
        console.log(`YeildDeposited Event Details:`);
        console.log(`Vault Address: ${vaultAddress}`);
        console.log(`Originator Address: ${originator}`);
        console.log(`From Address: ${fromAddress}`);
        console.log(`Assets: ${assets}`);
    } else {
        console.error('YeildDeposited event not found in transaction receipt.');
    }

    console.log(`Investor vault token shares: ${formatUnits(await vault.connect(investor).balanceOf(investor.address), 6)}`);
    console.log(`Investor asset token shares: ${formatUnits(await asset.connect(investor).balanceOf(investor.address), 6)}`);
    console.log(`Originator asset token shares: ${formatUnits(await asset.connect(originator).balanceOf(originator.address), 6)}`);

}

main();
