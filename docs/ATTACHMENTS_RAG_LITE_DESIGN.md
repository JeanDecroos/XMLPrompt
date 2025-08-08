## Attachments (RAG‑lite) — Cheap‑by‑default Design

### Objectives
- Keep per‑request token usage low and predictable by never sending full attachments to the LLM.
- Always use the cheapest path automatically; do not expose cost choices to users.
- Provide a clean UX for attaching files and seamlessly leveraging them for better answers.
- Maintain privacy and compliance with easy delete and explicit consent to index.

### UX Principles
- Users can attach files anywhere context is requested (Prompt Builder step). No cost/quality toggles are shown.
- On upload, we quietly compute a content hash and (optionally) extract text client‑side when feasible.
- We generate a short outline + key bullets per document using a small model (cheap). We store both the outline and select chunk embeddings.
- At query time, we retrieve only a small number of the most relevant snippets, respecting a strict token budget.

### System Overview
- Ingest pipeline:
  1) Parse text client‑side when possible (TXT/MD/CSV/JSON). For PDFs/DOCX, fallback to backend parsing only if user consents.
  2) Normalize and chunk text (500–800 tokens, 10–15% overlap).
  3) Create embeddings (economical embedding model); store in `document_chunks`.
  4) Create ultra‑short outline + bullets (cheap model); store in `document_summaries`.

- Query pipeline:
  1) Build prompt from: system + user message + tiny outline(s) + top‑k snippets (±3 sentence window) with citations.
  2) Enforce a strict token budget; truncate to fit.
  3) If confidence is low, optionally fetch a second pass of snippets (still capped).

### Token Strategy (Always Cheap)
- Hard budget gate: reserve room for system, user, and output; allocate the rest to snippets.
- Prefer summaries first; include snippets only when similarity exceeds a threshold.
- De‑duplicate across documents via content hashes.

### Privacy & Compliance
- Store only normalized text needed for retrieval (no raw binaries in the same table).
- Support full delete (Right to be Forgotten) by cascading `documents -> document_chunks -> summaries`.
- Encrypt at rest where feasible; restrict access via RLS to owner.
- Add redaction on ingest (basic PII patterns) with opt‑out toggle for power users.

### Minimal Data Model (Supabase/Postgres)
- `documents(id, user_id, title, content_hash, meta, created_at)`
- `document_chunks(id, document_id, chunk_index, text, embedding VECTOR, meta)`
- `document_summaries(document_id, outline, bullets, model, tokens, created_at)`

See `scripts/addAttachmentsSchema.sql` for a starter SQL.

### Backend APIs (draft)
- POST `/api/v1/attachments/upload` → returns `{ documentId }` after ingest.
- GET `/api/v1/attachments` → list of docs (title, size, created_at).
- DELETE `/api/v1/attachments/:id`
- POST `/api/v1/retrieval/query` → input: user message, optional doc ids; output: `snippets` and `citations` to augment prompts.

### Frontend Flow
- Attachment Manager (component) for upload/list/delete; no cost jargon.
- Retrieval helper merges top‑k snippets into the prompt behind the scenes.

### Telemetry
- Track per‑request tokens and retrieved snippet counts; surface only as internal metrics, not in UI.

### Rollout Plan
1) Ship schema + API stubs + frontend scaffolding (no runtime changes).
2) Implement client‑side parsing for text/CSV/JSON.
3) Add embeddings and summaries with cheap models.
4) Wire retrieval into the prompt flow with strict budget.


