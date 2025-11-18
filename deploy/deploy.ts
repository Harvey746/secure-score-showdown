import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("Deploying EncryptedMemoryMatch contract with account:", deployer);

  const encryptedMemoryMatch = await deploy("EncryptedMemoryMatch", {
    from: deployer,
    args: [],
    log: true,
  });

  console.log("EncryptedMemoryMatch deployed to:", encryptedMemoryMatch.address);
};

export default func;
func.tags = ["EncryptedMemoryMatch"];


