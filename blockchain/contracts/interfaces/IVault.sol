//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IVault {
    event InvestorAdded(address indexed user, uint256 timestamp, string message);
    event OriginatorAdded(address indexed user, uint256 timestamp, string message);
    
    event InvestorDeposited(address indexed investor, address indexed receiver, uint256 assets, uint256 shares);
    event InvestorWithdrawn(address indexed investor, address indexed receiver, uint256 assets, uint256 shares);
    event InvestorRedeemed(address indexed investor, address indexed receiver, uint256 assets, uint256 shares);

    event YeildDeposited(address indexed originator, address indexed fromAddress, uint256 assets);
    event LoanFunded(address indexed originator, address indexed borrower, uint256 assets);
    event LoanRepaid(address indexed originator, address indexed borrower, uint256 assets);
}
