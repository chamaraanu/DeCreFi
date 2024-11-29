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

    console.log(`Redeem flow`);
    const vault = await ethers.getContractAt('Vault', addresses.investorVault);
    // test functions 
    const name = await vault.connect(investor).name();
    console.log(`Name is: ${name}`);
    const setAsset = await vault.connect(investor).asset();
    console.log(`Asset is: ${setAsset}`);

    const asset = await ethers.getContractAt('Asset', addresses.asset);

    console.log(`Vault asset balance: ${formatUnits(await asset.balanceOf(vault.address), 6)}`);
    console.log(`Investor vault token shares: ${formatUnits(await vault.connect(investor).balanceOf(investor.address), 6)}`);

    let tx, receipt, event;
    tx = await vault.connect(investor).approve(vault.address, parseUnits('70', 6));
    await tx.wait();
    console.log(`Token approval done`);

    tx = await vault.connect(investor).redeem(parseUnits('70', 6), investor.address, investor.address);
    receipt = await tx.wait();

    // Fetch the emitted `InvestorRedeemed` event
    event = receipt.events?.find(e => e.event === 'InvestorRedeemed');
    if (event) {
        const { vault: vaultAddress, investor, receiver, assets, shares } = event.args!;
        console.log(`InvestorRedeemed Event Details:`);
        console.log(`Vault Address: ${vaultAddress}`);
        console.log(`Investor Address: ${investor}`);
        console.log(`Receiver: ${receiver}`);
        console.log(`Assets: ${assets}`);
        console.log(`Shares: ${shares}`);
    } else {
        console.error('InvestorWithdrawn event not found in transaction receipt.');
    }

    console.log(`Investor vault token shares: ${formatUnits(await vault.connect(investor).balanceOf(investor.address), 6)}`);
    console.log(`Investor assets balance: ${formatUnits(await asset.connect(investor).balanceOf(investor.address), 6)}`);

}

main();
