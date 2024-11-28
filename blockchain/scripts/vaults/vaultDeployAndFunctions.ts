import { ethers, upgrades } from "hardhat";
import { deployManagerDeployment } from "../contractDeployFunctions";
import { deployVaultInstance } from "../deployInstances";
import { deployOnchainIdInstance } from "../deployInstances-back";

async function main() {

  let [deployer, investor] = await ethers.getSigners();
  console.log("Deployer address- ", deployer.address);
  console.log("Investor address- ", investor.address);

  // Deploy DeployManager Contract and related contracts
  const addresses: string[] = await deployManagerDeployment(deployer);
  const deployManagerAddress = addresses[0];

  const Asset = await ethers.getContractFactory("Asset");
  const investorAsset = Asset.connect(investor);
  // Deploy the Asset proxy using investor
  const asset = await upgrades.deployProxy(investorAsset, ["Asset Token", "AST"], { initializer: 'initialize' });
  await asset.deployed();
  console.log(`Asset ${asset.address} Balance of the investor is ${await asset.balanceOf(investor.address)}`);

  console.log("Deploy manager deployed at: ", deployManagerAddress);
  console.log("Vault Logic Contract deployed at: ", addresses[10]);

  // Connect to DeployManager
  const DeployManager = await ethers.getContractFactory("DeployManager");
  const deployManager = await DeployManager.connect(deployer).attach(deployManagerAddress);

  // Deploy onchainId for Deployer/Issuer
  let deployerOnchainId = await deployOnchainIdInstance(
    deployManager,
    deployer.address
  );
  console.log(`OnchainId deployed for deployer/issuer ${deployer.address} at ${deployerOnchainId} `);

  // Deploy onchainId for investor
  let investorOnchainId = await deployOnchainIdInstance(
    deployManager,
    investor.address
  );
  console.log(`OnchainId deployed for investor ${investor.address} at ${investorOnchainId}`);

  // Connect to Identity contract
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.connect(deployer).attach(addresses[6]);

  await identityRegistry.connect(deployer).registerIdentity(investor.address, investorOnchainId, 42);

  //TREX 
  // Deploy implementations
  const tokenImplementation = await ethers.deployContract('Token', deployer);
  const claimTopicsRegistryImplementation = await ethers.deployContract('ClaimTopicsRegistry', deployer);
  const trustedIssuersRegistryImplementation = await ethers.deployContract('TrustedIssuersRegistry', deployer);
  const identityRegistryStorageImplementation = await ethers.deployContract('IdentityRegistryStorage', deployer);
  const identityRegistryImplementation = await ethers.deployContract('IdentityRegistry', deployer);
  const modularComplianceImplementation = await ethers.deployContract('ModularCompliance', deployer);

  const trexImplementationAuthority = await ethers.deployContract(
    'TREXImplementationAuthority',
    [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
    deployer,
  );
  const versionStruct = {
    major: 4,
    minor: 0,
    patch: 0,
  };
  const contractsStruct = {
    tokenImplementation: tokenImplementation.address,
    ctrImplementation: claimTopicsRegistryImplementation.address,
    irImplementation: identityRegistryImplementation.address,
    irsImplementation: identityRegistryStorageImplementation.address,
    tirImplementation: trustedIssuersRegistryImplementation.address,
    mcImplementation: modularComplianceImplementation.address,
  };
  await trexImplementationAuthority.connect(deployer).addAndUseTREXVersion(versionStruct, contractsStruct);

  const defaultCompliance = await ethers.deployContract('DefaultCompliance', deployer);
  //   const trexFactory = await ethers.deployContract('TREXFactory', [trexImplementationAuthority.address, identityFactory.address], deployer);

  // Deploy onchainId for investor
  let deployedERC3643Token = await deployERC3643Instance(
    deployManager,
    "ERC3643 Token",
    "TT",
    6,
    deployerOnchainId,
    investor,
    trexImplementationAuthority.address,
    identityRegistry.address,
    defaultCompliance.address
  );
  //let deployedERC3643Token = "0x7357f955700586aAA8Cfad1271354a1cCC353126";
  console.log(`ERC3643 Token has deployed at ${deployedERC3643Token}`);

  // Deploy vault for investor
  let investorVault = await deployVaultInstance(
    deployManager,
    asset.address,
    deployedERC3643Token,
    "CustomerVault",
    "CVL"
  );
  console.log(`Vault deployed at ${investorVault}`);

  // Connect to Token contract
  const Token = await ethers.getContractFactory("Token");
  const tokenContract = await Token.connect(deployer).attach(deployedERC3643Token);
  await tokenContract.connect(investor).addAgent(investorVault);

  console.log(`Deposit flow`);
  const vault = await ethers.getContractAt('Vault', investorVault);
  // test functions 
  const name = await vault.connect(investor).name();
  console.log(`Name is: ${name}`);

  const setAsset = await vault.connect(investor).asset();
  console.log(`Asset is: ${setAsset}`);


  await asset.connect(investor).approve(vault.address, 100);
  console.log(`Asset approval done`);
  await vault.connect(investor).deposit(100, investor.address);
  console.log(`Investor secure vault token shares: ${await tokenContract.connect(investor).balanceOf(investor.address)}`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
