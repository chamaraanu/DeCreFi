//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface ILoan is IERC1155Upgradeable {

    event LoanInitiated(
        uint256 indexed id,
        address borrower,
        address originator,
        address fundPool,
        uint256 interestRate,
        uint256 principal,
        uint256 startDate,
        uint256 maturityDate
    );

    event Mint(
        address indexed to,
        string tokenName,
        string tokenSymbol,
        string uri,
        uint256 tokenId,
        uint256 amount
    );

    event Burn(address indexed from, uint256 tokenId, uint256 amount);

    function mint(
        address to,
        uint256 amount,
        string memory tokenUri,
        address borrower,
        address originator, 
        address fundPool,
        uint256 interestRate,
        uint256 principal,
        uint256 startDate,
        uint256 maturityDate,
        bytes memory data
    )
        external returns (uint256);
}