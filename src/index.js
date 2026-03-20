import { Client, AccountInfoQuery, PrivateKey } from "@hashgraph/sdk";
import "dotenv/config";

async function main() {
    // 1. Validate environment variables
    const operatorId = process.env.OPERATOR_ID;
    const operatorKeyStr = process.env.OPERATOR_KEY;

    console.log("Rumi");

    if (!operatorId || !operatorKeyStr) {
        throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY must be set");

    }
}
main().catch(console.error);