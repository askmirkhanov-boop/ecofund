import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  const Token = await ethers.getContractFactory("EcoRewardToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log("EcoRewardToken deployed at:", await token.getAddress());

  const EcoFund = await ethers.getContractFactory("EcoFund");
  const ecofund = await EcoFund.deploy(await token.getAddress());
  await ecofund.waitForDeployment();

  console.log("EcoFund deployed at:", await ecofund.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});