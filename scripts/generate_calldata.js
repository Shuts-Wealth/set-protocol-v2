const ethers = require("ethers");

// Function selector for sellTokenForTokenToUniswapV3
const functionSelector = "0x6af479b2";

// Parameters
const encodedPath = ethers.utils.hexConcat([
  "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Replace with actual tokenA address
  ethers.utils.hexZeroPad("0x64", 3), // Replace with actual fee (e.g., 0.3% = 30000)
  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"  // Replace with actual tokenB address
]);
const inputTokenAmount = "6214399708"; // Replace with actual amount
const minOutputTokenAmount = ethers.utils.parseUnits("1", 8); // Replace with actual minimum amount
const recipient = "0xD14D1e501b2b52D6134dB1aD0857Aa91f9BFe2dd"; // Replace with actual recipient address

// Encode parameters
const encodedParameters = ethers.utils.defaultAbiCoder.encode(
  ["bytes", "uint256", "uint256", "address"],
  [encodedPath, inputTokenAmount, minOutputTokenAmount, recipient]
);

// Combine function selector and encoded parameters
const calldata = functionSelector + encodedParameters.slice(2);

console.log("Generated calldata:", calldata);


