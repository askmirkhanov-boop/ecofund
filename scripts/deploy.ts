import hre from "hardhat";

async function main() {
  const Token = await hre.ethers.getContractFactory("EcoRewardToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("Token deployed:", tokenAddress);

  const EcoFund = await hre.ethers.getContractFactory("EcoFund");
  const ecoFund = await EcoFund.deploy(tokenAddress);
  await ecoFund.waitForDeployment();

  console.log("EcoFund deployed:", await ecoFund.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
