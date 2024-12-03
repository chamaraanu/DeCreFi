import { ethers, upgrades } from "hardhat";
import { deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";

async function main() {
    let [deployer, investor, originator, borrower] = await ethers.getSigners();
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

    console.log(`Loan flow`);
    const loan = await ethers.getContractAt('Loan', addresses.loanToken);

    console.log(`Loan Address: ${loan.address}`);

    let tx, receipt, event;
    tx = await loan.connect(deployer).mint(
        originator.address,
        1,
        'QmRgippqroqi9T9qj6LvAKUpzvpdtU3uUpYomdLJ9eXPTf',
        borrower.address,
        originator.address,
        addresses.investorVault,
        100,
        1000,
        1000,
        1000,
        ethers.constants.HashZero
    );
    receipt = await tx.wait();

    // Fetch the emitted `Mint` event
    event = receipt.events?.find(e => e.event === 'Mint');
    if (event) {
        const { loan: to, tokenName, tokenSymbol, returnUri, tokenId, amount } = event.args!;
        console.log(`Mint Event Details`);
        console.log(`To: ${to}`);
        console.log(`Token Name: ${tokenName}`);
        console.log(`Token Symbol: ${tokenSymbol}`);
        console.log(`Return URI: ${returnUri}`);
        console.log(`Token Id: ${tokenId}`);
        console.log(`Amount: ${amount}`);
    } else {
        console.error('InvestorAdded event not found in transaction receipt.');
    }
}

main();
