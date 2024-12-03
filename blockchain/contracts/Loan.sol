//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import "./interfaces/ILoan.sol";

import "hardhat/console.sol";

contract Loan is ERC1155URIStorageUpgradeable, AccessControlUpgradeable, ILoan {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private tokenIdCounter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    string public tokenName;
    string public tokenSymbol;
    string public metaDataUri;

    mapping(uint256 => address) private _borrowers;
    mapping(uint256 => address) private _originators;
    mapping(uint256 => address) private _fundPools;
    mapping(uint256 => uint256) private _interestRates;
    mapping(uint256 => uint256) private _principals;
    mapping(uint256 => uint256) private _startDates;
    mapping(uint256 => uint256) private _maturityDates;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name, 
        string memory _symbol,
        string memory _baseUri,
        string memory _metadataUri,
        address admin
    ) public initializer {
        tokenName = _name;
        tokenSymbol = _symbol;
        metaDataUri = _metadataUri;

        __AccessControl_init();
        __ERC1155URIStorage_init();
        _setBaseURI(_baseUri);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

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
        external
        virtual
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = tokenIdCounter.current();
        tokenIdCounter.increment();

        _setURI(tokenId, tokenUri);
        _setLoan(tokenId, borrower, originator, fundPool, interestRate, principal, startDate, maturityDate);
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

    function _setLoan(
        uint256 tokenId, 
        address borrower, 
        address originator, 
        address fundPool, 
        uint256 interestRate, 
        uint256 principal, 
        uint256 startDate, 
        uint256 maturityDate
    ) internal virtual {
        _borrowers[tokenId] = borrower;
        _originators[tokenId] = originator;
        _fundPools[tokenId] = fundPool;
        _interestRates[tokenId] = interestRate;
        _principals[tokenId] = principal;
        _startDates[tokenId] = startDate;
        _maturityDates[tokenId] = maturityDate;
        emit LoanInitiated(tokenId, borrower, originator, fundPool, interestRate, principal, startDate, maturityDate);
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
