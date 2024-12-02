//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./interfaces/IVault.sol";

import "hardhat/console.sol";

contract Vault is 
    IVault,
    ERC4626Upgradeable,
    AccessControlUpgradeable {
    using MathUpgradeable for uint256;

    uint256 private constant _BASIS_POINT_SCALE = 1e4;
    uint256 private totalAssetsDeposited;
    uint256 private totalSharesOfferred;
    uint256 private exchangeRate;

    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");

    bytes32 public constant LOAN_MANAGER_ROLE = keccak256("LOAN_MANAGER_ROLE");

    bytes32 public constant ORIGINATOR_ROLE = keccak256("ORIGINATOR_ROLE");
    
    function initialize(
        IERC20Upgradeable asset, 
        string memory _name, 
        string memory _symbol,
        address admin
    ) public initializer {

        __AccessControl_init();
        __ERC20_init(_name, _symbol);  // Initialize ERC20Upgradeable
        __ERC4626_init(asset);        // Initialize ERC4626Upgradeable

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function deposit(uint256 assets, address receiver) onlyRole(INVESTOR_ROLE) public virtual override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");

        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);
        totalAssetsDeposited += assets;
        totalSharesOfferred += shares;

        emit InvestorDeposited(address(this), _msgSender(), receiver, assets, shares);

        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner) onlyRole(INVESTOR_ROLE) public virtual override returns (uint256) {
        require(assets <= maxWithdraw(owner), "ERC4626: withdraw more than max");

        uint256 shares = previewWithdraw(assets);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        totalAssetsDeposited -= assets;
        totalSharesOfferred -= shares;

        emit InvestorWithdrawn(address(this), _msgSender(), receiver, assets, shares);

        return shares;
    }

    function redeem(uint256 shares, address receiver, address owner) onlyRole(INVESTOR_ROLE) public virtual override returns (uint256) {
        require(shares <= maxRedeem(owner), "ERC4626: redeem more than max");

        uint256 assets = previewRedeem(shares);
        _withdraw(_msgSender(), receiver, owner, assets, shares);
        totalAssetsDeposited -= assets;
        totalSharesOfferred -= shares;

        emit InvestorRedeemed(address(this), _msgSender(), receiver, assets, shares);

        return assets;
    }

    function depositYield(address caller, uint256 assets) onlyRole(ORIGINATOR_ROLE) public {
        totalAssetsDeposited += assets;
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), caller, address(this), assets);

        emit YeildDeposited(address(this), _msgSender(), caller, assets);
    }

    function fundLoan(address caller, uint256 assets) onlyRole(ORIGINATOR_ROLE) public { // later to be changed to fund the actual loan than the caller
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeApprove(IERC20Upgradeable(assetAddress), address(this), assets);
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), address(this), caller, assets);

        emit LoanFunded(address(this), _msgSender(), caller, assets);
    }

    function repayLoan(address caller, uint256 assets) onlyRole(ORIGINATOR_ROLE) public {
        address assetAddress = super.asset();
        SafeERC20Upgradeable.safeTransferFrom(IERC20Upgradeable(assetAddress), caller, address(this), assets);

        emit LoanRepaid(address(this), _msgSender(), caller, assets);
    }

    function getExchangeRate() public view returns (uint256) {
        return totalAssetsDeposited * 10 **18 / totalSharesOfferred;
    }

    function addInvestor(address investor) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(INVESTOR_ROLE, investor);
        emit InvestorAdded(address(this), investor, block.timestamp, "Investor added");
    }

    function addOriginator(address originator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ORIGINATOR_ROLE, originator);
        emit OriginatorAdded(address(this), originator, block.timestamp, "Originator added");
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