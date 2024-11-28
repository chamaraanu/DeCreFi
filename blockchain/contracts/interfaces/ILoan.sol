//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface ILoan is IERC1155Upgradeable {

    event Mint(
        address indexed to,
        string tokenName,
        string tokenSymbol,
        string uri,
        uint256 tokenId,
        uint256 amount
    );

    event Burn(address indexed from, uint256 tokenId, uint256 amount);

}