/// <reference types="vite/client" />

// The site's build-time settings; see config.ts (#123).
interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_HEDERA_NETWORK?: string;
  readonly VITE_MIRROR_NODE_URL?: string;
  readonly VITE_UMINA_TOKEN_ID?: string;
  readonly VITE_ACHALA_TOKEN_ID?: string;
  readonly VITE_PROVENANCE_TOPIC_ID?: string;
  readonly VITE_DISPLAY_TOPIC_ID?: string;
  readonly VITE_TREASURY_ACCOUNT_ID?: string;
  readonly VITE_IPFS_GATEWAY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
