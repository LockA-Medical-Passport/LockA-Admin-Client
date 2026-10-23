# Admin Client Codebase

The **LockA Admin Client** is the administrative interface for [LockA Medical Passport](https://github.com/LockA-Medical-Passport/LockA-Documentation/blob/main/Documentation.md) — a decentralized digital health identity and medical records platform, built on a hybrid Stellar/Soroban blockchain and off-chain storage architecture, that gives patients direct, portable control over their healthcare data.

## Purpose

Health providers (hospitals, clinics, laboratories, pharmacies, insurers) apply to join the LockA network through the provider onboarding flow. Before a provider can be authorized to request patient record access or write records to a patient's passport, an administrator must review and approve their application. This repository is that review interface — the tool administrators use to:

- View and triage the queue of pending health provider applications
- Verify submitted provider credentials and identity information
- Approve or reject provider registration requests
- Manage authorized staff associated with an approved provider
- Maintain oversight of provider status recorded in the on-chain `ProviderRegistry`

## How it fits into the platform

LockA anchors identity, provider verification, consent, and audit events on the Stellar network via Soroban smart contracts, while encrypted medical records themselves stay off-chain. This admin client is the operational front end for the **provider verification** step of that architecture: approval decisions made here are what allow a provider's status in the `ProviderRegistry` contract to move from _pending_ to _verified_, which the patient and provider clients rely on before any access request or record write is permitted.

### Related repositories

| Repository                           | Role                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------- |
| `locka-patient-client`               | Patient onboarding, passport management, QR sharing, consent approval                       |
| `locka-provider-client`              | Provider dashboard: registration, access requests, record uploads                           |
| **`LockA-Admin-Client`** (this repo) | Admin review and approval of health provider applications                                   |
| `locka-api`                          | Auth, provider verification services, encrypted storage integration, Stellar event indexing |
| `locka-contracts`                    | Soroban smart contracts, including `ProviderRegistry`                                       |

## Design reference

UI/UX for this client follows the design system established in [this LockA build](https://locka.remixdapp.eth.limo/).

## Tech stack

Consistent with the rest of the LockA platform:

| Layer               | Technology                                                        |
| ------------------- | ----------------------------------------------------------------- |
| Frontend            | React/Next.js with Tailwind CSS                                   |
| Wallet              | Freighter (Stellar) for MVP                                       |
| Blockchain          | Stellar network / Soroban smart contracts                         |
| Backend integration | `locka-api` (auth, provider verification, Stellar event indexing) |

## Core workflow: provider application approval

1. A health provider registers through the provider client and submits credentials for verification.
2. The application enters this admin client's review queue.
3. An admin reviews the submitted credentials and identity information.
4. The admin approves or rejects the application.
5. On approval, the provider's verified status is recorded on-chain via the `ProviderRegistry` contract.
6. The provider can now request patient record access through the provider client.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See [ARCHITECTURE.md](ARCHITECTURE.md) for
how the codebase is organized, and [issues.md](issues.md) (or the
[issue tracker](https://github.com/LockA-Medical-Passport/LockA-Admin-Client/issues)) for the
build-out roadmap.

## License

MIT — see [LICENSE](LICENSE).

---

Part of the LockA Medical Passport platform. For full platform/product documentation, see [LockA-Documentation](https://github.com/LockA-Medical-Passport/LockA-Documentation/blob/main/Documentation.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
