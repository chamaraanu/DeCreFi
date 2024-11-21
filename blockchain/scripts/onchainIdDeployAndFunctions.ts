import { ethers } from "hardhat";
import { deployManagerDeployment } from "./contractDeployFunctions";
import { deployERC3643Instance, deployOnchainIdInstance } from "./deployInstances";
import { BigNumber, Signer } from "ethers";

async function main() {
  //   const signers = await ethers.getSigners();
  // signers.forEach((signer, index) => {
  //   console.log(`Signer ${index}: ${signer.address}`);
  // });

  // if (signers.length < 2) {
  //   console.error("Not enough signers available");
  //   return;
  // }

    let [deployer, investor] = await ethers.getSigners();
    // investor = deployer;
    console.log("Deployer address- ", deployer.address);
    console.log("Investor address- ", investor.address);

    const deployerKey = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [deployer.address]));
    const investorkey = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [investor.address]))

    // Deploy DeployManager Contract and related contracts
    const addresses: string[] = await deployManagerDeployment(deployer);
    const deployManagerAddress = addresses[0];

    console.log("Deploy manager deployed at: ", deployManagerAddress);
    console.log("IdentityLogic Contract deployed at: ", addresses[1]);
    console.log("IdentityImplementationAuthority deployed at: ", addresses[2]);
    console.log("ClaimIssuer deployed at: ", addresses[3]);
    console.log("ClaimTopicsRegistry deployed at: ", addresses[4]);
    console.log("IdentityRegistry deployed at: ", addresses[6]);

    //const deployManagerAddress = "0x0E801D84Fa97b50751Dbf25036d067dCf18858bF";
    // // Connect to DeployManager
    const DeployManager = await ethers.getContractFactory("DeployManager");
    const deployManager = await DeployManager.connect(deployer).attach(deployManagerAddress);

    // Deploy onchainId for investor
    let investorOnchainId = await deployOnchainIdInstance(
        deployManager,
        investor.address
    );
    console.log(`OnchainId deployed for investor ${investor.address} at ${investorOnchainId}`);

    const investorOnchainIdFunction = await deployManager.getOnchainId(investor.address);
    console.log("investorOnchainIdFunction - " , investorOnchainIdFunction);

    // Deploy onchainId for Deployer/Issuer
    let deployerOnchainId = await deployOnchainIdInstance(
        deployManager,
        deployer.address
    );
    console.log(`OnchainId deployed for deployer/issuer ${deployer.address} at ${deployerOnchainId} `);

    // Connect to ClaimIssuer contract
    const ClaimIssuer = await ethers.getContractFactory("ClaimIssuer");
    const claimIssuerContract = await ClaimIssuer.connect(deployer).attach(addresses[3]);

    // Connect to ClaimTopicsRegistry contract
    const ClaimTopicsRegistry = await ethers.getContractFactory("ClaimTopicsRegistry");
    const claimTopicsRegistry = await ClaimTopicsRegistry.connect(deployer).attach(addresses[4]);

    let tx = await claimTopicsRegistry.addClaimTopic(1); //KYC

    // Connect to TrustedIssuersRegistry contract
    const TrustedIssuersRegistry = await ethers.getContractFactory("TrustedIssuersRegistry");
    const trustedIssuersRegistry = await TrustedIssuersRegistry.connect(deployer).attach(addresses[9]);

    const claimTopics: BigNumber[] = await claimTopicsRegistry.getClaimTopics();
    console.log("Claim topics - ", claimTopics);

    await trustedIssuersRegistry.addTrustedIssuer(claimIssuerContract.address, claimTopics);

    // Connect to Identity contract
    const Identity = await ethers.getContractFactory("Identity");
    const investorIdentity = await Identity.connect(deployer).attach(investorOnchainId);

    // Connect to Identity contract
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = await IdentityRegistry.connect(deployer).attach(addresses[6]);

    //await identityRegistry.connect(deployer).addAgent(deployer.address);
    const registerIdentityTx = await identityRegistry.connect(deployer).registerIdentity(investor.address, investorIdentity.address, 42);
    console.log("registerIdentityTx - ", registerIdentityTx.hash);
    const getIdentityTx = await identityRegistry.identity(investor.address);
    console.log("getIdentityTx - ", getIdentityTx);

    // Add CLAIM purpose for Deployer key by user/investor
    const addKeyDeployertx = await investorIdentity.connect(investor).addKey(deployerKey, 3, 1);
    console.log("Add key deployer tx - ", addKeyDeployertx.hash);
    const deployerGetKey = await investorIdentity.getKey(deployerKey);
    console.log("Added claim purpose to deployer key - ", deployerGetKey);

    // // Add CLAIM purpose for Investor key 
    const addKeyInvestorTx = await investorIdentity.connect(investor).addKey(investorkey, 3, 1);
    console.log("Add key investor tx - ", addKeyInvestorTx.hash);
    const investorGetKey = await investorIdentity.getKey(investorkey);
    console.log("Added claim purpose to investor key - ", investorGetKey);

    // // Delete CLAIM purpose for Investor key 
    // const removePurposeKeyInvestorTx = await investorIdentity.connect(investor).removeKey(investorkey, 3);
    // console.log("Remove purpose key investor tx - ", removePurposeKeyInvestorTx.hash);
    // const investorGetKeyLatest = await investorIdentity.getKey(investorkey);
    // console.log("Removed claim purpose to investor key - ", investorGetKeyLatest);

    const claimForInvestor = {
        data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some claim public data.')),
        issuer: claimIssuerContract.address,
        topic: claimTopics[0],
        scheme: 1,
        identity: investorIdentity.address,
        signature: '',
      };
    claimForInvestor.signature = await deployer.signMessage(
        ethers.utils.arrayify(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForInvestor.identity, claimForInvestor.topic, claimForInvestor.data]),
            ),
        ),
    );

    // Add claim by deployer
    const addClaimTx = await investorIdentity
        .connect(deployer)
        .addClaim(claimForInvestor.topic, claimForInvestor.scheme, claimForInvestor.issuer, claimForInvestor.signature, claimForInvestor.data, '');
    console.log("Add claim tx - ", addClaimTx.hash);

    let claimId = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [claimIssuerContract.address, claimTopics[0]]));
    console.log("claim Id - " , claimId);
    const getClaim = await investorIdentity.getClaim(claimId);
    console.log("Get claim - ", getClaim);

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

    // Connect to Identity contract
    const Token = await ethers.getContractFactory("Token");
    const tokenContract = await Token.connect(deployer).attach(deployedERC3643Token);
    
    const beforeOwner = await tokenContract.owner();
    console.log("Before Token owner - ", beforeOwner);
    console.log("investor address - ", investor.address);
    console.log("Deploy manager deployed at: ", deployManagerAddress);

    await tokenContract.connect(investor).addAgent(deployer.address);

    await tokenContract.connect(deployer).mint(investor.address, 1000);
    const investorBefore = await tokenContract.balanceOf(investor.address);
    const deployerBefore = await tokenContract.balanceOf(deployer.address);
    console.log("investorBefore - ", investorBefore);
    console.log("deployerBefore - ", deployerBefore);

    let paused = await tokenContract.paused();
    console.log("paused======>", paused);
    await tokenContract.unpause();
    paused = await tokenContract.paused();
    console.log("paused======>", paused);

    await tokenContract.connect(investor).transfer(investor.address, 25);
    const investorAfter = await tokenContract.balanceOf(investor.address);
    const deployerAfter = await tokenContract.balanceOf(deployer.address);
    console.log("investorAfter - ", investorAfter);
    console.log("deployerAfter - ", deployerAfter);
    
    // const INFURA_SEPOLIA_API_KEY = process.env.INFURA_SEPOLIA_API_KEY != undefined ? process.env.INFURA_SEPOLIA_API_KEY:""

    // const provider = new ethers.providers.JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_SEPOLIA_API_KEY}`);
    // //const deployManagerSigner = new ethers.Signer(deployManagerAddress, provider);
    // //const tranferOwnership = await tokenContract.connect(deployManagerSigner).transferOwnership(deployer.address);
    // //console.log("tranferOwnership - ", tranferOwnership);

    // const afterOwner = await tokenContract.owner();
    // console.log("Before Token owner - ", afterOwner);
    // // const tx = await tokenContract.connect(deployManager).addAgent(deployer.address);
    // // console.log("Add agent # ", tx.hash);
    // // const mintTx = await tokenContract.connect(deployer).mint(investor.address, 1000);
    // // console.log("mint # ", mintTx);
    // // const balance = await tokenContract.balanceOf(investor.address);
    // // console.log("Balance of investor - ", balance);


}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
