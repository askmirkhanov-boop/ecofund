import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EcoFundModule = buildModule("EcoFundModule", (m) => {
  const token = m.contract("EcoRewardToken");

  const ecofund = m.contract("EcoFund", [token]);

  return { token, ecofund };
});

export default EcoFundModule;
