import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const UNISWAP_POOL_ABI = [
    "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)",
];

async function main() {
    console.log("Starting script...");
    console.log("Pool Address:", process.env.UNISWAP_POOL_ADDRESS);
    console.log("WebSocket URL:", process.env.WS_PROVIDER_URL);

    const provider = new ethers.WebSocketProvider(process.env.WS_PROVIDER_URL!);
    
    // Wait for provider to be ready
    await provider.ready;
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name, "chainId:", network.chainId);

    const poolAddress = process.env.UNISWAP_POOL_ADDRESS!;
    const pool = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, provider);

    // Test if we can query the pool
    try {
        const code = await provider.getCode(poolAddress);
        console.log("Contract code length:", code.length);
        if (code === "0x") {
            console.error("No contract found at pool address!");
            process.exit(1);
        }
        console.log("Contract found at pool address");
    } catch (error) {
        console.error("Error checking pool contract:", error);
        process.exit(1);
    }

    console.log("Setting up event listener...");

    // Listen for all events from the pool
    pool.on("*", (event) => {
        console.log("Received some event:", event);
    });

    // Listen specifically for Swap events
    pool.on("Swap", async (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) => {
        console.log("\nSwap event detected!");
        console.log("Sender:", sender);
        console.log("Recipient:", recipient);
        console.log("Amount0:", amount0.toString());
        console.log("Amount1:", amount1.toString());
        console.log("Transaction hash:", event.log.transactionHash);
        
        const block = await provider.getBlock(event.log.blockNumber + 1);
        if (block) {
            console.log("First transaction in next block:", block.transactions[0]);
        }
    });

    console.log("Listening for events... (waiting for first event)");

    // Keep the script running
    process.stdin.resume();
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
