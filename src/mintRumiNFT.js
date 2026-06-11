/**
 * @file mintRumiNFT.js
 * @description Script to mint a Rumi NFT and create an IPFS record for metadata.
 *
 * Run from the command line:
 * node mintRumiNFT.js
 *
 * ## Output
 * - IPFS CID of pinned metadata
 * - Minted NFT serial number(s)
 * - Provenance log (stone_id, event, actor_id, ipfs_cid, timestamp)
 */

import dotenv from "dotenv";
import { Client, PrivateKey, TokenMintTransaction } from "@hashgraph/sdk";
import fs from "fs";
import { create } from "ipfs-http-client";
import { validateMetadata } from "./metadataValidator.js";
import fs from "fs";

// For Testnet
dotenv.config({ path: ".env.testnet" });
// For Mainnet
// dotenv.config({ path: ".env.mainnet" });

async function main() {
  // --- 1. Connect to Hedera ---
  const operatorId = process.env.OPERATOR_ID;

  // For Testnet
  const client = Client.forTestnet().setOperator(
    operatorId,
    PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY),
  );
  // For Mainnet
  // const client = Client.forMainnet().setOperator(
  //   operatorId,
  //   PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY)
  // );

  // --- 2. Prepare HIP‑412 JSON metadata ---
  const metadata = JSON.parse(fs.readFileSync("src/example_1.json", "utf8"));
  metadata.timestamp = new Date().toISOString(); // add dynamic field
  // Validate metadata JSON against HIP-412 schema ---
  const { valid, errors } = validateMetadata(metadata);
  if (!valid) {
    console.error("❌ Metadata validation failed:", errors);
    process.exit(1);
  }

  // --- 3. Pin metadata JSON to IPFS ---
  const ipfs = create({ url: "https://ipfs.infura.io:5001" });
  const { cid } = await ipfs.add(JSON.stringify(metadata));
  const ipfsUri = `ipfs://${cid.toString()}`;
  console.log(`✅ Metadata pinned to IPFS: ${ipfsUri}`);

  // --- 4. Mint NFT under existing Rumi Token ID ---
  const rumiTokenId = process.env.RUMI_TOKEN_ID;
  const mintTx = new TokenMintTransaction()
    .setTokenId(rumiTokenId)
    .setMetadata([Buffer.from(ipfsUri)]);

  const mintResponse = await mintTx.execute(client);
  const mintReceipt = await mintResponse.getReceipt(client);
  console.log(`✅ Minted Rumi NFT serials: ${mintReceipt.serials}`);

  // --- 5. Provenance logging ---
  console.log({
    stone_id: `RUMI-${mintReceipt.serials[0]}`,
    event: "MINT",
    actor_id: operatorId,
    ipfs_cid: cid.toString(),
    timestamp: new Date().toISOString(),
  });
}

main().catch(console.error);
