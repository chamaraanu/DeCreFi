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
    bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");

    mapping(uint256 => Drawdowns) private _drawDowns;

    address private _originator;
    address private _borrower;
    uint256 private _totalCreditLimit;
    uint256 private _remainingLimit;
    uint256 private _expiryDate;

    ILoan private _loan;
    IVault private _vault;

    function initialize(
        address originator,
        address borrower,
        uint256 totalCreditLimit,
        uint256 expiryDate,
        address loan,
        address vault
    ) public initializer {
        __AccessControl_init();

        _originator = originator;
        _borrower = borrower;
        _grantRole(ORIGINATOR_ROLE, originator);
        _grantRole(BORROWER_ROLE, borrower);

        _totalCreditLimit = totalCreditLimit;
        _expiryDate = expiryDate;

        _loan = ILoan(loan);
        _vault = IVault(vault);
    }

    function drawdown(
        string memory tokenUri,
        uint256 interestRate,
        uint256 drawdownAmount,
        uint256 startDate,
        uint256 maturityDate,
        bytes memory data
    ) external onlyRole(BORROWER_ROLE) {

        require(block.timestamp < _expiryDate, "Credit Facility is expired");
        require(drawdownAmount < _remainingLimit, "Drawdown amount is higher than the remaining limit");
        uint256 tokenId = _loan.mint(_originator, tokenUri, _borrower, _originator, address(_vault), interestRate, drawdownAmount, startDate, maturityDate, data);
        _vault.fundLoan(_borrower, drawdownAmount);

        emit LoanIssued(
            tokenId,
            _borrower,
            _msgSender(),
            address(_vault),
            interestRate,
            drawdownAmount,
            startDate,
            maturityDate
        );
    }
}
