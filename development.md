# Rumi: Development Strategy & Compliance Framework

This strategy outlines the implementation of **Rumi**, a project on **Hedera** designed to automate compliance and illuminate the provenance of tokenized Peruvian stones.

## 1. Provenance & Legal Triage
Categorize every asset into one of two cryptographic tracks to manage the variability of Peruvian sourcing.

*   **Track A: Documented Origin**
    *   For stones with [REINFO](https://padron.minem.gob.pe) (Mining Formalization) or [VUCE](https://www.vuce.gob.pe) permits.
    *   **2026 Compliance:** Ensure the miner's REINFO status is active prior to the **Dec 31, 2026** expiration.
    *   Map mining concession coordinates and [SUNAT](https://www.sunat.gob.pe) invoice data to the metadata.
    *   "Documented Origin" includes active REINFOs on extinguished concessions, provided the link is proven.
*   **Track B: Legacy & Retail**
    *   For stones purchased in shops or markets without a documented history.
    *   Establish the **Point of Sale (PoS)** in Peru as the genesis event.
    *   Focus metadata on "Peruvian Heritage" and the artistry of the mount.

## 2. Compliance Automation & Regulatory Database Integration
Explicitly link the minting process to official Peruvian government databases to ensure high-integrity Real World Asset (RWA) tokenization. Every asset undergoes an automated "Regulatory Handshake" before the NFT is generated.

### 🏛️ Authority & Database Mapping

| Authority | Resource | Validation Purpose |
| :--- | :--- | :--- |
| **MINEM** | [REINFO Search](https://padron.minem.gob.pe) | Verifies the mining concession is active and the miner is in a state of **Vigente**. |
| **SUNAT** | [RUC Consultation](https://e-consultaruc.sunat.gob.pe) | Cross-referenced against the **SUNAT RUC Database** to ensure the shop is a legal commercial entity under **Article 6**. |
| **VUCE** | [Permit Verification](https://www.vuce.gob.pe) | Validates export authorizations and **Digital Certificates of Origin (COD)**. |

New 2026 Requirement (Ley 32537): Mandatory "Proceso de Sinceramiento." The Regulatory Handshake must confirm georeferenced coordinates were submitted via the Ventanilla Virtual. Failure to complete this by April 25, 2026, results in an automatic REINFO suspension, rendering the asset ineligible for minting.

Census Gate (Post-June 2026): Handshake must include the INEI Census Participation ID to ensure the miner is part of the 2026 National MAPE Registry.

"Regulatory Handshake" must specifically check for the Vigente status, as Suspendido is now the trigger for 2026 non-compliance.

### 🔗 Technical Implementation: HCS Proof of Compliance
*   **Immutable Timestamping:** Every successful query to a Peruvian database is logged as a message on a dedicated **Hedera Consensus Service (HCS)** Topic.
*   **Cryptographic Linkage:** The unique Topic ID (e.g., `0.0.987654`) is embedded into the NFT metadata under the `compliance_proof_hcs` field.
*   **Auditability:** Customs officers at [SERPOST](http://www.exportafacil.gob.pe) or international buyers can query the HCS Topic to view the raw, timestamped response from the government database at the moment of minting.

## 3. Metadata Standardization ([HIP-412](https://hips.hedera.com))
Standardize the JSON schema to align with **PROMPERÚ** and international trade standards. Adopting this standard for the 27+ listed specimens ensures interoperability across the Hedera ecosystem.

*   **Legal Status Field:** **Values like** `certified_origin`, `retail_acquisition`, or `legacy_collection`.
*   **Identification:** Capture the **RUC** (Tax ID) of the vendor or the **RNA (Registro Nacional del Artesano)** ID of the artisan.
*   **Compliance Fields:** Include `last_regulatory_check` (ISO 8601 timestamp) and `REINFO Status`.

## 4. 📘 Implementation Guide: HS Code & Export Automation
To streamline international trade, Rumi maps specimens to official Peruvian HS Codes, allowing metadata to function as a **Digital Packing List**.

### Mapping Strategy
*   **Worked Semi-Precious Stones:** (Amethyst, Opal, Turquoise, etc.) — **7103.99.00.00**.
*   **High-Value Precious Stones:** (Worked Emeralds) — **7103.91.00.00**.
*   **Unwrought Minerals:** (Gold) — **7108.12.00.00**; (Silver) — **7106.91.00.00**.
*   **Special Classifications:** (Raw Pyrite crystals) — **2502.00.00.00**.

### Automation Workflow
1.  **Selection:** User selects a stone for purchase.
2.  **Lookup:** The dApp queries the **HIP-412** metadata for the embedded `hs_code`.
3.  **Digital Certificate (COD):** System generates the **Digital Certificate of Origin (COD)** via the VUCE Interoperability API, facilitating paperless trade for regional partners in the Andean Community and Pacific Alliance.
4.  **Form Population:** System auto-fills **Exporta Fácil (DEF)** or **VUCE** digital forms.
5.  **Compliance Check:** Stones identified as **"Patrimonio Cultural"** (Chapter 97) are automatically blocked from receiving export-ready HS codes.

Digital Signature Hashing: The XML XAdES-BES digital signature from the VUCE COD is hashed (SHA-256) and recorded on HCS to provide immutable, machine-verifiable proof of origin for international customs.

## 5. The Validation Layer
*   **Multi-Sig Sign-off:** A local expert or gemologist must sign the minting transaction via a **Hedera Threshold Key**.
*   **Cultural Protection:** Verify that the stone is not a protected archaeological artifact (**Patrimonio Cultural**) via [Ministerio de Cultura](https://www.gob.pe) datasets.

## 6. Physical-to-Digital Anchoring
*   **Optical Fingerprinting:** Capture macro-photography of unique internal inclusions and upload to **IPFS**.
*   **Immutable Logs:** Use **HCS** to record the stone's journey from shop to buyer.
*   **Physical Pairing:** Issue a QR-enabled **"Rumi Identity Card"** to link the specimen to its Mainnet record.

## 7. Artisan & Marketplace Onboarding
*   **Artisan Profiles:** Create decentralized identifiers (DIDs) for craftsmen.
*   **RNA Verification:** Cross-reference the **RNA ID** against the [MINCETUR database](https://artesania.mincetur.gob.pe) to validate techniques and artisan standing.

## 8. Regulatory & Legal Framework
Rumi tokens are governed by the **[Ley General de Minería (DS Nº 014-92-EM)](https://www.gob.pe)**.

Ley Nº 32537 (Dec 2025): Extends REINFO validity to Dec 31, 2026, and mandates a National Census of Small-Scale Mining (INEI/MINEM) to be conducted by June 2026.

SUNAFIL Integration: 2026 regulations now require verifying that REINFO holders have incorporated their workers into the formal payroll (Planilla).

Res. de Superintendencia Nº 0051-2026-SUNAFIL: Approved the 2026 directive for mandatory workplace inspections of REINFO holders. Rumi's due diligence includes verifying the existence of the required Electronic Payroll (Planilla Electrónica).

Ley Nº 32537: Specifically modifies DL 1293 (Formalization) and DL 1107 (Control of Mineral Trade), requiring adquirentes (like Rumi) to verify the specific extraction concession.

*   **Article 4 (Libre Comercialización):** Guarantees the right to free trade of mineral products.
*   **Article 6 (Posesión de Minerales):** Governs the legal possession of minerals by retailers and artisans.
*   **Article 263 (Comercialización Interna):** Regulates the purchase and sale of minerals for transformation or export.


testnet token id : 0.0.8130672