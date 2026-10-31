# SHRED — Project Documentation

This folder contains durable documentation for The Shred Roadmap.

## Document authority
1. `MASTERPLAN.md` — authoritative product vision, requirements, safeguards and phase prompts.
2. `CHECKPOINT.md` — current execution status and next actions.
3. `PHASE_LOG.md` — chronological record of implementation, review and approval.
4. `phase-prompts/` — copy-ready implementation prompts.

Keep these documents on `main` so they remain available independently of development branches. Update the Checkpoint and Phase Log after every phase review or approval. Do not let Gemini rewrite the Masterplan without explicit approval.

Code development happens on phase-specific branches, never directly on `main`. Merge only after independent review. Keep local backups of all complete HTML deliverables and the original baseline.

**Public repository warning:** never store passwords, private tokens, service-account credentials, private keys, personal user data or other secrets in this repository.
