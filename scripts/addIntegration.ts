import { ethers } from "hardhat";

// === CONFIGURE THESE VALUES ===
const INTEGRATION_REGISTRY = "0x4c4C649455c6433dC48ff1571C9e50aC58f0CeFA";
const TRADE_MODULE = "0xd04AabadEd11e92Fefcd92eEdbBC81b184CdAc82"; // <-- Replace with your TradeModule address
const ADAPTER_ADDRESS = "0x6967CC820ba47620c5a32ee5b495EB08F4DcDcFB";
const INTEGRATION_NAME = "UNISWAPV3_V2";

const ABI = [
  "function addIntegration(address _module, string _name, address _adapter) external"
];

async function main() {
  const [signer] = await ethers.getSigners();
  const registry = new ethers.Contract(INTEGRATION_REGISTRY, ABI, signer);

  console.log("Adding integration:");
  console.log("  Module:", TRADE_MODULE);
  console.log("  Name:", INTEGRATION_NAME);
  console.log("  Adapter:", ADAPTER_ADDRESS);

  // Estimate gas limit
  const gasLimit = await registry.estimateGas.addIntegration(TRADE_MODULE, INTEGRATION_NAME, ADAPTER_ADDRESS);
  // Set a reasonable gas price (e.g., 50 gwei)
  const gasPrice = ethers.utils.parseUnits("50", "gwei");

  const tx = await registry.addIntegration(
    TRADE_MODULE,
    INTEGRATION_NAME,
    ADAPTER_ADDRESS,
    { gasLimit, gasPrice }
  );
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("Integration added!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
