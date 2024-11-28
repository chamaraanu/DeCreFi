//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./interfaces/ILoan.sol";

contract Loan is ERC1155URIStorageUpgradeable, AccessControlUpgradeable, ILoan {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    string public tokenName;
    string public tokenSymbol;
    string public metaDataUri;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name, 
        string memory _symbol,
        string memory _baseUri,
        string memory _metadataUri
    ) public initializer {
        tokenName = _name;
        tokenSymbol = _symbol;
        metaDataUri = _metadataUri;

        __AccessControl_init();
        __ERC1155URIStorage_init();
        _setBaseURI(_baseUri);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(
        address to,
        uint256 amount,
        string memory tokenUri,
        bytes memory data
    )
        external
        virtual
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();

        _setURI(tokenId, tokenUri);
        emitMintEvent(to, uri(tokenId), tokenId, amount);

        _mint(to, tokenId, amount, data);
    }

    function emitMintEvent(
        address to,
        string memory returnUri,
        uint256 tokenId,
        uint256 amount
    ) private {
        emit Mint(
            to,
            tokenName,
            tokenSymbol,
            returnUri,
            tokenId,
            amount
        );
    }

    function burn(
        uint256 tokenId,
        uint256 amount
    )
        external
        virtual
        onlyRole(BURNER_ROLE)
    {
        _burn(_msgSender(), tokenId, amount);

        emit Burn(_msgSender(), tokenId, amount);
    }

    /**
     * @notice Checks if a contract supports a given interface.
     * @param interfaceId The interface identifier.
     * @return A boolean indicating whether the contract supports the interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlUpgradeable, ERC1155Upgradeable, IERC165Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
