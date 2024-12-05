import { ethers, upgrades } from "hardhat";
import { deployVaultInstance } from "../deployInstances";
import { appendJsonToFile, readJsonFromFile } from "../helpers/appendJSONToFile";
import { parseUnits } from "ethers/lib/utils";

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

    console.log(`Loan issue flow`);
    const loanManager = await ethers.getContractAt('LoanManager', addresses.loanManager);

    console.log(`Loan Manager Address: ${loanManager.address}`);

    let tx, receipt, event;
    tx = await loanManager.connect(originator).fundDrawdown(
        0,
        borrower.address,
        parseUnits('20', 6)
    );
    receipt = await tx.wait();

    // Fetch the emitted `DrawdownFunded` event
    event = receipt.events?.find(e => e.event === 'DrawdownFunded');
    if (event) {
        const { loanManager: tokenId, borrower, originator, fundPool, amount } = event.args!;
        console.log(`DrawdownFunded Event Details`);
        console.log(`Loan token Id: ${tokenId}`);
        console.log(`Borrower: ${borrower}`);
        console.log(`Originator: ${originator}`);
        console.log(`Fund Pool: ${fundPool}`);
        console.log(`Drawdown Amount: ${amount}`);
    } else {
        console.error('DrawdownFunded event not found in transaction receipt.');
    }

    const loan = await ethers.getContractAt('Loan', addresses.loanToken);

    console.log(`Originator loan token balance (principal) is: ${await loan.balanceOf(originator.address, 0)}`);
}

main();
