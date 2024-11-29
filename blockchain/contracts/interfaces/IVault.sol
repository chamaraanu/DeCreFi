//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IVault {
    event InvestorAdded(address indexed vault, address indexed user, uint256 timestamp, string message);
    event OriginatorAdded(address indexed vault, address indexed user, uint256 timestamp, string message);
    
    event InvestorDeposited(address indexed vault, address indexed investor, address indexed receiver, uint256 assets, uint256 shares);
    event InvestorWithdrawn(address indexed vault, address indexed investor, address indexed receiver, uint256 assets, uint256 shares);
    event InvestorRedeemed(address indexed vault, address indexed investor, address indexed receiver, uint256 assets, uint256 shares);

    event YeildDeposited(address indexed vault, address indexed originator, address indexed fromAddress, uint256 assets);
    event LoanFunded(address indexed vault, address indexed originator, address indexed borrower, uint256 assets);
    event LoanRepaid(address indexed vault, address indexed originator, address indexed borrower, uint256 assets);
}
