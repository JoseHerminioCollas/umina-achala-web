// src/wallet/walletTestMain.tsx
// Entry of the development-only wallet test page (frontend/wallet-test.html, #58).
import React from "react";
import ReactDOM from "react-dom/client";
import WalletTest from "./WalletTest";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WalletTest />
  </React.StrictMode>,
);
