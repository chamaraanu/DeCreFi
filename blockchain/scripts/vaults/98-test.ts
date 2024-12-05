import { ethers, upgrades } from "hardhat";
import { readJsonFromFile } from "../helpers/appendJSONToFile";
import { formatUnits } from "ethers/lib/utils";

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

    const asset = await ethers.getContractAt('Asset', addresses.asset);
    console.log(`Balance of the investor is ${formatUnits(await asset.balanceOf(investor.address), 6)}`);
    console.log(`Balance of the originator is ${formatUnits(await asset.balanceOf(originator.address), 6)}`);
    console.log(`Balance of the borrower is ${formatUnits(await asset.balanceOf(borrower.address), 6)}`);
}

main();
