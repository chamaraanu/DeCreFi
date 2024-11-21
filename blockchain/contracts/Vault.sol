//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "hardhat/console.sol";

contract Vault is ERC4626Upgradeable {
    uint256 private constant _BASIS_POINT_SCALE = 1e4;
    
    function initialize(IERC20Upgradeable asset, string memory _name, string memory _symbol) public initializer {
        __ERC20_init(_name, _symbol);  // Initialize ERC20Upgradeable
        __ERC4626_init(asset);        // Initialize ERC4626Upgradeable
    }

    function depositYeild(address caller, uint256 assets) public {
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), caller, address(this), assets);
    }

}