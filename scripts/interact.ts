import { ethers } from "hardhat";

async function main() {
  const ecoFundAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const EcoFund = await ethers.getContractFactory("EcoFund");
  const ecoFund = EcoFund.attach(ecoFundAddress);

  const tx = await ecoFund.rewardUser(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    ethers.parseUnits("100", 18)
  );

  await tx.wait();
  console.log("Reward sent!");
}

main().catch(console.error);
