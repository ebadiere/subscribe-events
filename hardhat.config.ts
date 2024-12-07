import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      forking: {
        url: process.env.WS_PROVIDER_URL || "",
        blockNumber: 8453000 // Base mainnet block
      }
    }
  }
};

export default config;
