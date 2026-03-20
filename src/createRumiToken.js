import {
    Client,
    CustomRoyaltyFee,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    PrivateKey
} from "@hashgraph/sdk";
import "dotenv/config";

async function main() {
    // 1. Initialize Client with ECDSA
    const operatorId = process.env.OPERATOR_ID;
    const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    // const client = Client.forMainnet().setOperator(operatorId, operatorKey);
    console.log("Creating Rumi Gemstone NFT Class...");

    // 2. Define the Token
    const transaction = new TokenCreateTransaction()
        .setTokenName("Rumi")
        .setTokenSymbol("RUMI")
        .setTokenType(TokenType.NonFungibleUnique) // Makes it an NFT
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(operatorId)
        .setSupplyType(TokenSupplyType.Infinite)

        // Keys - Using your ECDSA key for all roles
        .setAdminKey(operatorKey)   // To update token properties
        .setSupplyKey(operatorKey)  // To mint new gemstones
        .setMetadataKey(operatorKey) // To update NFT data (HIP-646/850)
        .setPauseKey(operatorKey) // NEW: Security freeze capability
        .setFeeScheduleKey(operatorKey)
        .setCustomFees([
            new CustomRoyaltyFee()
                .setNumerator(5)
                .setDenominator(100)
                .setFeeCollectorAccountId(operatorId)
        ])
        .setWipeKey(operatorKey) // Essential for removing lost/seized assets
        .setTokenMemo("Rumi Provenance: Authentic Peruvian Gemstones")
        .freezeWith(client);

    // 3. Sign and Execute
    const signTx = await transaction.sign(operatorKey);
    const response = await signTx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log("-----------------------------------");
    console.log(`✅ Success! Rumi Token ID: ${receipt.tokenId}`);
    console.log("-----------------------------------");
    console.log("SAVE THIS ID IN YOUR .env FILE AS: RUMI_TOKEN_ID");

    client.close();
}

main().catch(console.error);