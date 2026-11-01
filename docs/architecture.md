# SignalGrid GTM Intelligence & Data Quality Engine

## System Overview
SignalGrid is an enterprise-grade Revenue Operations (RevOps) middleware platform designed to ingest go to market intent signals, enforce rigorous data validation, execute automated account qualification scoring against Ideal Customer Profile (ICP) parameters, and synchronize clean records to HubSpot CRM with built-in retry resilience.

## Core Architectural Modules
1. **Module A (Ingestion & Normalization):** Simulates real-time webhook payloads from intent data providers (such as Clay) representing mid-market B2B software accounts.
2. **Module B (Validation & Governance):** Enforces strict runtime data schemas using Zod to prevent malformed or incomplete records from polluting downstream CRM instances.
3. **Module C (ICP Scoring Engine):** Evaluates account firmographics, technology stacks (e.g., AWS, Kubernetes), and intent scores to categorize leads as `QUALIFIED` or `DISQUALIFIED`.
4. **Module D (CRM Synchronization):** Interfaces with the HubSpot CRM API v3 to upsert contacts and companies securely via bearer token authentication.
5. **Module E (Resilience & Audit Logging):** Implements exponential backoff retry mechanisms for transient network failures and records every state transition (`VALIDATED`, `SYNCED`, `MATCHED`) into a local SQLite audit database (`better-sqlite3`).
6. **Module F & G (Operational Dashboard):** Exposes an Express REST API endpoint (`/api/metrics`) providing real-time pipeline telemetry, synchronization success rates, and audit logs.

## Tech Stack
* **Runtime:** Node.js, TypeScript
* **Framework:** Express
* **Validation & Schema:** Zod
* **Persistence:** SQLite (`better sqlite3`)
* **HTTP Client:** Axios
* **Testing:** Jest, ts-jest