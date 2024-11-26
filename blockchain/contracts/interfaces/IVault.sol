//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IVault {
    event InvestorAdded(address indexed user, uint256 timestamp, string message);
    event OriginatorAdded(address indexed user, uint256 timestamp, string message);
}
