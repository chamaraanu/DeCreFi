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
    tx = await loanManager.connect(originator).issueLoan(
        borrower.address,
        parseUnits('100', 6),
        'QmRgippqroqi9T9qj6LvAKUpzvpdtU3uUpYomdLJ9eXPTf',
        100,
        1000,
        1000,
        1000,
        ethers.constants.HashZero
    );
    receipt = await tx.wait();

    // Fetch the emitted `LoanIssued` event
    event = receipt.events?.find(e => e.event === 'LoanIssued');
    if (event) {
        const { loanManager: tokenId, borrower, originator, fundPool, interestRate, principal, startDate, maturityDate } = event.args!;
        console.log(`LoanIssued Event Details`);
        console.log(`Loan token Id: ${tokenId}`);
        console.log(`Borrower: ${borrower}`);
        console.log(`Originator: ${originator}`);
        console.log(`Fund Pool: ${fundPool}`);
        console.log(`Interest Rate: ${interestRate}`);
        console.log(`Principal: ${principal}`);
        console.log(`Start Date: ${startDate}`);
        console.log(`Maturity Date: ${maturityDate}`);
    } else {
        console.error('LoanIssued event not found in transaction receipt.');
    }

    const loan = await ethers.getContractAt('Loan', addresses.loanToken);

    console.log(`Originator loan token is: ${await loan.balanceOf(originator.address, 0)}`);
}

main();
