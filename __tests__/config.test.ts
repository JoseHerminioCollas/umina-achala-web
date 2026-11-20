import {
  ACHALA_TOKEN_ID,
  CONTACT_FORM_URL,
  DISPLAY_TOPIC_ID,
  IPFS_GATEWAY_URL,
  MIRROR_NODE_URL,
  NETWORK,
  PROVENANCE_TOPIC_ID,
  TREASURY_ACCOUNT_ID,
  UMINA_TOKEN_ID,
} from "../frontend/src/config";

describe("config", () => {
  it("CONTACT_FORM_URL is a published Google Form responder link", () => {
    expect(CONTACT_FORM_URL).toMatch(
      /^https:\/\/docs\.google\.com\/forms\/d\/e\/[\w-]+\/viewform$/,
    );
  });
});

describe("chain settings (#123)", () => {
  it("defaults to testnet, its mirror node and Pinata's gateway", () => {
    expect(NETWORK).toBe("testnet");
    expect(MIRROR_NODE_URL).toBe("https://testnet.mirrornode.hedera.com");
    expect(IPFS_GATEWAY_URL).toBe("https://gateway.pinata.cloud/ipfs/");
  });

  it("has the testnet tokens, topics and Treasury as defaults", () => {
    expect(UMINA_TOKEN_ID).toBe("0.0.11400486");
    expect(ACHALA_TOKEN_ID).toBe("0.0.11400589");
    expect(PROVENANCE_TOPIC_ID).toBe("0.0.11400670");
    expect(DISPLAY_TOPIC_ID).toBe("0.0.11400772");
    expect(TREASURY_ACCOUNT_ID).toBe("0.0.4631334");
  });
});
