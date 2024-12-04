//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface ILoanManager {

    event LoanIssued(
        uint256 indexed id,
        address borrower,
        address originator,
        address fundPool,
        uint256 interestRate,
        uint256 principal,
        uint256 startDate,
        uint256 maturityDate
    );

}
