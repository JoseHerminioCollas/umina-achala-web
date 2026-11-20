import {
  hashscanNftUrl,
  hashscanTopicUrl,
  ipfsToGatewayUrl,
} from "../frontend/src/utils/chainLinks";

describe("chainLinks", () => {
  it("links an NFT to its HashScan page on the site's network, testnet (#75)", () => {
    expect(hashscanNftUrl("0.0.11400486", 7)).toBe(
      "https://hashscan.io/testnet/token/0.0.11400486/nft/7",
    );
  });

  it("links a topic to its HashScan page on testnet", () => {
    expect(hashscanTopicUrl("0.0.11400670")).toBe(
      "https://hashscan.io/testnet/topic/0.0.11400670",
    );
  });

  it("turns ipfs:// URLs into gateway URLs, path included", () => {
    expect(ipfsToGatewayUrl("ipfs://bafyabc/photo.png")).toBe(
      "https://gateway.pinata.cloud/ipfs/bafyabc/photo.png",
    );
    expect(ipfsToGatewayUrl("ipfs://bafyabc")).toBe(
      "https://gateway.pinata.cloud/ipfs/bafyabc",
    );
  });

  it("leaves other URLs as they are", () => {
    expect(ipfsToGatewayUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(ipfsToGatewayUrl("/images/stone.jpg")).toBe("/images/stone.jpg");
  });
});
