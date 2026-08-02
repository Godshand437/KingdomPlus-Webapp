const fs = require('fs');
const { Connection, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');

// A list of alternative Devnet servers to bypass congestion
const RPC_ENDPOINTS = [
  'https://api.devnet.solana.com',  
  'https://solana-devnet.g.alchemy.com/v2/demo',
  'https://rpc.ankr.com/solana_devnet'
];

(async () => {
  let connection;
  let connected = false;

  console.log("⏳ Hunting for a stable Solana Devnet server...");

  // 1. Auto-rotate through servers until one responds
  for (const url of RPC_ENDPOINTS) {
    try {
      console.log(`Testing server: ${url}...`);
      connection = new Connection(url, 'confirmed');
      await connection.getLatestBlockhash(); // Ping the server to test it
      console.log("✅ Stable connection established!");
      connected = true;
      break; // Stop looking once we find a good one
    } catch (e) {
      console.log(`❌ Server overloaded, trying the next one...`);
    }
  }

  if (!connected) {
    console.log("\n🛑 All public Devnet servers are currently down or rejecting requests. Please try again in 15 minutes.");
    return;
  }

  // 2. Load your saved wallet that holds the 1 SOL
  let treasuryWallet;
  if (fs.existsSync('treasury.json')) {
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('treasury.json')));
    treasuryWallet = Keypair.fromSecretKey(secretKey);
    console.log("\n🏦 Loaded Saved Treasury Wallet:", treasuryWallet.publicKey.toBase58());
  } else {
    console.log("\n🛑 ERROR: Could not find treasury.json. Did you delete it?");
    return;
  }

  try {
    // 3. Verify balance
    const balance = await connection.getBalance(treasuryWallet.publicKey);
    const solBalance = balance / 1e9;
    console.log(`💰 Current Balance: ${solBalance} SOL`);

    if (solBalance < 0.05) {
      console.log("🛑 INSUFFICIENT SOL. Please send Devnet SOL to:", treasuryWallet.publicKey.toBase58());
      return;
    }

    // 4. Create the KPC Token Mint
    console.log("🪙 Balance verified! Creating the KPC Token Mint...");
    const mint = await createMint(connection, treasuryWallet, treasuryWallet.publicKey, null, 8);
    console.log("✅ Token Mint Created!");

    // 5. Create a Token Account for the Treasury to hold the supply
    console.log("📦 Setting up Treasury Vault...");
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, treasuryWallet, mint, treasuryWallet.publicKey
    );

    // 6. Mint 1,000,000 KPC into the Treasury
    console.log("🖨️ Minting 1,000,000 KPC initial supply...");
    await mintTo(
      connection, treasuryWallet, mint, treasuryTokenAccount.address, treasuryWallet, 1000000 * Math.pow(10, 8)
    );

    // 7. Output the integration keys
    console.log("\n==================================================");
    console.log("🎉 SUCCESS! COPY THESE TWO LINES INTO APP.JS:");
    console.log("==================================================\n");
    console.log(`const GLOBAL_KPC_MINT = "${mint.toBase58()}";`);
    console.log(`const GLOBAL_TREASURY_KEY = new Uint8Array([${Array.from(treasuryWallet.secretKey)}]);\n`);

  } catch (error) {
    console.log("\n❌ Transaction failed. The network might have dropped the request mid-way. Run the script again!");
    console.error(error.message);
  }
})();