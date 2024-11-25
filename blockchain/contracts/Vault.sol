//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "hardhat/console.sol";

contract Vault is ERC4626Upgradeable {
    using MathUpgradeable for uint256;

    uint256 private constant _BASIS_POINT_SCALE = 1e4;
    uint256 private totalAssetsDeposited;
    uint256 private totalSharesOfferred;
    uint256 private exchangeRate;

    
    function initialize(IERC20Upgradeable asset, string memory _name, string memory _symbol) public initializer {
        __ERC20_init(_name, _symbol);  // Initialize ERC20Upgradeable
        __ERC4626_init(asset);        // Initialize ERC4626Upgradeable
    }

    function deposit(uint256 assets, address receiver) public virtual override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");

        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);
        totalAssetsDeposited += assets;
        totalSharesOfferred += shares;

        return shares;
    }

    function depositYield(address caller, uint256 assets) public {
        totalAssetsDeposited += assets;
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), caller, address(this), assets);
    }

    function fundLoan(address caller, uint256 assets) public { // later to be changed to fund the actual loan than the caller
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeApprove(IERC20Upgradeable(assetAddress), address(this), assets);
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), address(this), caller, assets);
    }

    function repayLoan(address caller, uint256 assets) public {
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), caller, address(this), assets);
    }

    function getExchangeRate() public view returns (uint256) {
        return totalAssetsDeposited * 10 **18 / totalSharesOfferred;
    }

    /**
     * @dev Internal conversion function (from assets to shares) with support for rounding direction.
     */
    function _convertToShares(uint256 assets, MathUpgradeable.Rounding rounding) internal view virtual override returns (uint256) {
        return assets.mulDiv(totalSharesOfferred + 10 ** _decimalsOffset(), totalAssetsDeposited + 1, rounding);
    }

    /**
     * @dev Internal conversion function (from shares to assets) with support for rounding direction.
     */
    function _convertToAssets(uint256 shares, MathUpgradeable.Rounding rounding) internal view virtual override returns (uint256) {
        return shares.mulDiv(totalAssetsDeposited + 1, totalSharesOfferred + 10 ** _decimalsOffset(), rounding);
    }

}