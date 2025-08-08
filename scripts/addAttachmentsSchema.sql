-- Cheap-by-default Attachments (RAG-lite) schema
-- Note: vector requires pgvector extension

-- enable extension if available
-- CREATE EXTENSION IF NOT EXISTS vector;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  content_hash text not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  text text not null,
  embedding vector(1536),
  meta jsonb default '{}'::jsonb
);

create table if not exists public.document_summaries (
  document_id uuid primary key references public.documents(id) on delete cascade,
  outline text,
  bullets text,
  model text,
  tokens integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_user on public.documents(user_id);
create index if not exists idx_document_chunks_doc on public.document_chunks(document_id);
-- Optional: ivfflat or hnsw index for vectors depending on extension/config
-- create index if not exists idx_document_chunks_embedding on public.document_chunks using ivfflat (embedding vector_cosine_ops);


