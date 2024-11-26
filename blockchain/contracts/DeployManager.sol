//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DeployManager {

    event VaultContractDeployed(
        address indexed vaultContractAddress
    );

    address immutable erc4626LogicAddress;


    constructor(
        address _erc4626LogicAddress
    ) {
        _validateZeroAddress(_erc4626LogicAddress, "_erc4626LogicAddress");
        erc4626LogicAddress = _erc4626LogicAddress;
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
            vaultContractAddress
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
}

struct DeployVault {
    address assetAddress;
    string vaultName;
    string vaultSymbol;
    address adminAddress;
}

interface InterfaceERC4626 {
    function initialize(
        address _asset, string memory _name, string memory _symbol, address admin
    ) external;
}
