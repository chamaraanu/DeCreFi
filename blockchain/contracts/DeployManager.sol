//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DeployManager {

    event VaultContractDeployed(
        address indexed vaultContractAddress
    );

    event LoanContractDeployed(
        address indexed loanContractAddress
    );

    address immutable erc4626LogicAddress;
    address immutable erc1155LogicAddress;


    constructor(
        address _erc4626LogicAddress,
        address _erc1155LogicAddress
    ) {
        _validateZeroAddress(_erc4626LogicAddress, "_erc4626LogicAddress");
        _validateZeroAddress(_erc1155LogicAddress, "_erc1155LogicAddress");
        erc4626LogicAddress = _erc4626LogicAddress;
        erc1155LogicAddress = _erc1155LogicAddress;
    }

    error ZeroAddressError(string field);

    function _validateZeroAddress(
        address value,
        string memory field
    ) internal pure {
        if (value == address(0)) {
            revert ZeroAddressError(field);
        }
    }

    function deployVault(
        DeployVault calldata inputArgs
    ) public returns (address[1] memory) {
        address vaultContractAddress = _deployVault(
            inputArgs.assetAddress,
            inputArgs.vaultName,
            inputArgs.vaultSymbol,
            inputArgs.adminAddress
        );
        
        emit VaultContractDeployed(
            vaultContractAddress // emit vaultName and vaultSymbol
        );
        return [vaultContractAddress];
    }

    function _deployVault(
        address assetAddress,
        string memory vaultName,
        string memory vaultSymbol,
        address adminAddress
    ) internal returns (address) {
        bytes memory initArgs = abi.encodeCall(
            InterfaceERC4626.initialize,
            (
                assetAddress,
                vaultName,
                vaultSymbol,
                adminAddress
            )
        );
        return address(new ERC1967Proxy(erc4626LogicAddress, initArgs));
    }

    function deployLoan(
        DeployLoan calldata inputArgs
    ) public returns (address[1] memory) {
        address loanContractAddress = _deployLoan(
            inputArgs.tokenName,
            inputArgs.tokenSymbol,
            inputArgs.baseUri,
            inputArgs.metaDataUri,
            inputArgs.adminAddress
        );
        
        emit LoanContractDeployed(
            loanContractAddress
        );
        return [loanContractAddress];
    }

    function _deployLoan(
        string memory tokenName,
        string memory tokenSymbol,
        string memory baseUri,
        string memory metaDataUri,
        address adminAddress
    ) internal returns (address) {
        bytes memory initArgs = abi.encodeCall(
            InterfaceERC1155.initialize,
            (
                tokenName,
                tokenSymbol,
                baseUri,
                metaDataUri,
                adminAddress
            )
        );
        return address(new ERC1967Proxy(erc1155LogicAddress, initArgs));
    }
}

struct DeployVault {
    address assetAddress;
    string vaultName;
    string vaultSymbol;
    address adminAddress;
}

struct DeployLoan {
    string tokenName;
    string tokenSymbol;
    string baseUri;
    string metaDataUri;
    address adminAddress;
}

interface InterfaceERC4626 {
    function initialize(
        address _asset, string memory _name, string memory _symbol, address admin
    ) external;
}

interface InterfaceERC1155 {
    function initialize(
        string memory tokenName,
        string memory tokenSymbol,
        string memory baseUri,
        string memory metaDataUri,
        address adminAddress
    ) external;
}
