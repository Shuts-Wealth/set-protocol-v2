import { ethers, providers } from "ethers";

export const privateKeys = [  
  "0x8d0f0b6f27dee8e115f860c20293e7f2fef567e584ad5cefa05ea14ab1365898"
];

export function generatedWallets(provider: providers.Provider) {
  return privateKeys.map((key: string) => {
    return new ethers.Wallet(key, provider);
  });
}
