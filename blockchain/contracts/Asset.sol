//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract Asset is ERC20Upgradeable {
    function initialize(string memory _name, string memory _symbol) public initializer {
        __ERC20_init(_name, _symbol);  // Initialize ERC20Upgradeable
        _mint(msg.sender, 1000 * 10 ** 6);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

}