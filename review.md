# ✅ Rumi Project – Mainnet Review Checklist

## 1. Token Governance
- [ ] **Key Separation**: Admin, Supply, Metadata, Fee Schedule, Pause, and Wipe keys are not all held by one account.
- [ ] **Multi-Sig / Threshold Keys**: Sensitive roles (Admin, Metadata, Fee Schedule) require multi-signature approval.
- [ ] **Supply Type Decision**: Confirm Infinite vs. Finite supply strategy and document rationale.
- [ ] **Royalty Governance**: Rules for adjusting fees are documented and transparent.

## 2. Metadata & Provenance
- [ ] **Immutable Core Fields**: Stone ID, HS Code, Mining Concession, REINFO ID are locked at minting.
- [ ] **Mutable State Fields**: Export status, artisan RNA, regulatory check timestamps are governed and anchored in HCS.
- [ ] **HCS Anchoring**: Every metadata update is mirrored in Hedera Consensus Service with timestamp + hash.
- [ ] **Schema Validation**: Metadata conforms to HIP-412 and passes JSON schema validation.

## 3. Compliance Integration
- [ ] **REINFO Validation**: Confirm integration or mock API calls for mining concession checks.
- [ ] **SUNAT RUC Check**: Vendor RUC cross-referenced against SUNAT database.
- [ ] **VUCE COD Generation**: Export certificates simulated/tested.
- [ ] **Census & Payroll Fields**: INEI Census ID and SUNAFIL payroll verification included in metadata.

## 4. Lifecycle Events
- [ ] **Genesis Event**: Properly logged in HCS with stone_id and compliance hash.
- [ ] **Transformation Event**: Artisan RNA and scans updated, HCS log created.
- [ ] **Sales Event**: Royalties routed correctly to treasury.
- [ ] **Export Event**: Export permit hashed, metadata updated, HCS notarization complete.

## 5. Security & Trust
- [ ] **Key Storage**: Private keys secured (not plain `.env`), ideally in a vault.
- [ ] **Pause/Wipe Usage**: Governance rules defined for when tokens can be paused or wiped.
- [ ] **Audit Trail**: Customs officers/buyers can query HCS topic for full lifecycle.

## 6. Scalability & Performance
- [ ] **HCS Topic Strategy**: Confirm single-topic design is performant; consider sharding if needed.
- [ ] **IPFS Pinning**: Ensure images, scans, and documents are pinned and retrievable.
- [ ] **Marketplace Simulation**: Test buying/selling flow with multiple NFTs.

## 7. Documentation & Presentation
- [ ] **README Polished**: Clear identity, problem/solution, lifecycle, compliance uniqueness.
- [ ] **Developer Appendix**: SDK snippets separated from narrative.
- [ ] **Risk & Mitigation Section**: Anticipated issues documented with solutions.
- [ ] **Future Vision**: Rumi Coin, smart contract transition, cross-chain liquidity outlined.

---
