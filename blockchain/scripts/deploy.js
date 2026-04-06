const hre = require("hardhat");

async function main() {
  console.log("Deploying ProductRegistry contract...");

  const ProductRegistry =
    await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();

  await productRegistry.waitForDeployment();

  const address = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", address);
  console.log("Save this address! You will need it for the frontend.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
