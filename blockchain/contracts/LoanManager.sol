//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./interfaces/ILoanManager.sol";
import "./interfaces/ILoan.sol";
import "./interfaces/IVault.sol";
import "./Loan.sol";

import "hardhat/console.sol";

contract LoanManager is ILoanManager,  AccessControlUpgradeable {

    bytes32 public constant ORIGINATOR_ROLE = keccak256("ORIGINATOR_ROLE");

    ILoan public _loan;
    IVault public _vault;

    function initialize(
        address loan,
        address vault,
        address originator
    ) public initializer {
        __AccessControl_init();
        _grantRole(ORIGINATOR_ROLE, originator);

        _loan = ILoan(loan);
        _vault = IVault(vault);
    }

    function issueLoan(
        address borrower,
        string memory tokenUri,
        uint256 interestRate,
        uint256 principal,
        uint256 startDate,
        uint256 maturityDate,
        bytes memory data
    ) external onlyRole(ORIGINATOR_ROLE) {

        uint256 tokenId = _loan.mint(_msgSender(), principal, tokenUri, borrower, _msgSender(), address(_vault), interestRate, principal, startDate, maturityDate, data);

        emit LoanIssued(
            tokenId,
            borrower,
            _msgSender(),
            address(_vault),
            interestRate,
            principal,
            startDate,
            maturityDate
        );
    }

    function fundDrawdown(
        uint256 tokenId,
        address borrower, 
        uint256 amount
    ) external onlyRole(ORIGINATOR_ROLE) {

        _loan.burn(tokenId, amount, _msgSender());
        _vault.fundLoan(borrower, amount);

        emit DrawdownFunded(
            tokenId,
            borrower,
            _msgSender(),
            address(_vault),
            amount
        );
    }

}
