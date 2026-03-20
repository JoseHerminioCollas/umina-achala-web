# 📜 Rumi Metadata Schema (MVP)

Rumi NFTs represent **stones with verified provenance**. Mounted stones (jewelry) will later evolve into Achala, but for now Rumi focuses on provenance-first compliance.

---

## ✅ Required Provenance Data
Every Rumi NFT must include:

- **stone_id** → Unique identifier for the stone in Rumi.
- **concession_id** → Mining concession number (INGEMMET).
- **reinfo_id** → REINFO registration number (formalized miner).
- **vendor_ruc** → SUNAT tax ID of the vendor/exporter.
- **hs_code** → Harmonized System Code (classification for customs).
- **vuce_cod** → Certificate of Origin code for export (when applicable).
- **compliance_proof_hcs** → Hedera Consensus Service transaction ID anchoring provenance.

---

## ✅ Required Artisan Data (Mounted Stones / Jewelry)
Mandatory only if the stone is mounted (becomes jewelry):

- **artisan_rna** → Registro Nacional del Artesano ID (required for jewelry).
- **mount_type** → Description of how the stone is mounted (e.g., bezel, prong, filigree).
- **artisan_technique** → Optional field for cultural/artistic technique (e.g., filigree, repoussé).
- **artisan_signature** → Optional hash or digital signature linking artisan identity to the NFT.

---

## 🔧 Compliance Proof Flow
1. Collect provenance + artisan data.
2. Create JSON payload for compliance event.
3. Submit payload to Hedera Consensus Service (HCS).
4. Capture transaction ID → `compliance_proof_hcs`.
5. Attach transaction ID to NFT metadata.
6. Customs/buyers can query Hedera to verify compliance.

---

## 📌 Example: Stone NFT Metadata
```json
{
  "stone_id": "RUMI-2026-MP-02",
  "concession_id": "INGEMMET-12345",
  "reinfo_id": "REINFO-67890",
  "vendor_ruc": "20123456789",
  "hs_code": "7103.21.00.00",
  "vuce_cod": "VUCE-2026-0001",
  "compliance_proof_hcs": "0.0.987654@1678901234.000000000"
}
```

# 🏗️ Rumi System Architecture (MVP)

## Components
- **User / Exporter** → Initiates NFT minting with stone data.
- **Peruvian Registries**:
  - INGEMMET → validates `concession_id`.
  - REINFO → validates `reinfo_id`.
  - SUNAT → validates `vendor_ruc`.
  - VUCE → validates `vuce_cod` (Certificate of Origin).
- **HS Code Service** → confirms correct customs classification.
- **Hedera Consensus Service (HCS)** → notarizes compliance payload, returns transaction ID.
- **Rumi NFT Smart Contract** → mints NFT with metadata including `compliance_proof_hcs`.

---

## 🔧 Workflow
1. **Data Collection**
   - Exporter submits stone/jewelry details.
   - System queries INGEMMET, REINFO, SUNAT, VUCE APIs to validate provenance.

2. **Classification**
   - HS Code service confirms correct code for customs.

3. **Compliance Event**
   - JSON payload created with validated provenance + artisan data.
   - Payload submitted to Hedera Consensus Service (HCS).

4. **Proof Capture**
   - HCS returns transaction ID → stored as `compliance_proof_hcs`.

5. **NFT Minting**
   - Rumi smart contract mints NFT with:
     - Provenance fields (concession, REINFO, RUC, HS Code, COD).
     - Artisan fields (RNA, mount type) if jewelry.
     - `compliance_proof_hcs` anchor.

6. **Verification**
   - Customs, buyers, or judges query Hedera for the transaction ID.
   - They see the notarized compliance payload, proving authenticity.

---

## 📌 Data Flow Diagram (Textual)


Exporter → Rumi System → INGEMMET API

REINFO API

SUNAT API

VUCE API

HS Code Service

→ Compliance Payload → Hedera Consensus Service (HCS)

→ Transaction ID → Rumi NFT Metadata (compliance_proof_hcs)

→ Mint NFT → Marketplace / Customs Verification


---

## ✅ Key Value
- **APIs ensure authenticity** (official registries).
- **HCS ensures immutability** (tamper-proof compliance proof).
- **NFT ensures portability** (global trade + cultural storytelling).


# 🛠️ Rumi Developer Minting Checklist (Testnet MVP)

## Step 1: Collect Provenance Data
- [ ] Assign `stone_id` (unique identifier).
- [ ] Validate `concession_id` via INGEMMET API.
- [ ] Validate `reinfo_id` via REINFO API.
- [ ] Validate `vendor_ruc` via SUNAT API.
- [ ] Validate `vuce_cod` via VUCE API (if export event).
- [ ] Confirm correct `hs_code` classification via customs/trade API.

## Step 2: Prepare Compliance Payload
- [ ] Build JSON payload with validated fields:
```json
{
  "stone_id": "...",
  "concession_id": "...",
  "reinfo_id": "...",
  "vendor_ruc": "...",
  "hs_code": "...",
  "vuce_cod": "...",
  "timestamp": "YYYY-MM-DDTHH:mm:ss"
}
```

Step 3: Submit to Hedera Consensus Service (HCS)
- [ ] Use Hedera SDK (JavaScript/TypeScript/Python).

- [ ] Send payload to testnet HCS topic (e.g., 0.0.987654).

- [ ] Capture returned transaction ID.

Step 4: Attach Compliance Proof
- [ ] Store transaction ID as compliance_proof_hcs in NFT metadata.

- [ ] Example:

"compliance_proof_hcs": "0.0.987654@1678901234.000000000"

Step 5: Mint Rumi NFT
- [ ] Deploy/mint via Hedera Token Service (HTS).

- [ ] Attach metadata JSON including:

- **Provenance fields (mandatory).

- **Artisan fields (mandatory if mounted/jewelry).

- **compliance_proof_hcs.


Step 6: Verification Flow
- [ ] Customs/buyers query Hedera testnet for compliance_proof_hcs.

- [ ] Verify payload matches NFT metadata.

- [ ] Confirm provenance + artisan authenticity.



