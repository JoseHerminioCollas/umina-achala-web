// src/utils/chainLinks.ts
// Links built from the chain settings in config.ts (#123): HashScan pages on
// the site's network (#75) and ipfs:// URLs through the gateway.
import { IPFS_GATEWAY_URL, NETWORK } from "../config";

const HASHSCAN = `https://hashscan.io/${NETWORK}`;

/** The HashScan page of one NFT: a token and a serial number. */
export const hashscanNftUrl = (tokenId: string, serialNumber: number | string) =>
  `${HASHSCAN}/token/${tokenId}/${serialNumber}`;

/** The HashScan page of an HCS topic. */
export const hashscanTopicUrl = (topicId: string) => `${HASHSCAN}/topic/${topicId}`;

/**
 * The HashScan page of one HCS message, by its consensus timestamp, opened on
 * its Message tab (the message's content), not the transaction's Summary.
 */
export const hashscanMessageUrl = (consensusTimestamp: string) =>
  `${HASHSCAN}/transaction/${consensusTimestamp}/message`;

/**
 * The HashScan page of a transaction, by its ID: "0.0.N@seconds.nanos"
 * becomes HashScan's "0.0.N-seconds-nanos".
 */
export const hashscanTransactionUrl = (transactionId: string) => {
  const [payer, at = ""] = transactionId.split("@");
  return `${HASHSCAN}/transaction/${payer}-${at.replace(".", "-")}`;
};

/**
 * An ipfs:// URL as a gateway URL, e.g. "ipfs://<cid>/photo.png" →
 * "https://gateway.pinata.cloud/ipfs/<cid>/photo.png". Any other URL (https,
 * a local path) is returned as it is.
 */
export const ipfsToGatewayUrl = (url: string) =>
  url.startsWith("ipfs://") ? IPFS_GATEWAY_URL + url.slice("ipfs://".length) : url;
