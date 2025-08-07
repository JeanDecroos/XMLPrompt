## Promptr (XML Prompter) — Product Goal

**Purpose**: Help anyone quickly create high‑quality, model‑optimized prompts that produce reliable results across leading AI models (Claude, GPT, Gemini, etc.). The app turns basic intent into a clear, structured prompt with best‑practice guidance, then lets users save and securely share their work.

### Who this is for
- Professionals across roles (engineering, design, marketing, analysis, education).
- Individuals and teams who need consistent, reusable prompts.
- Free users and Pro subscribers (higher limits, advanced options).

### Core outcome
- Reduce time to a great prompt from minutes to seconds.
- Increase prompt quality, clarity, and consistency.
- Make prompts portable across models and formats (XML, JSON, Markdown, YAML, structured text).

### Primary user flow (3 steps)
1) Build intent: capture role, task, context, requirements, style, and output preferences.
2) Select model: get a recommendation and pick the best model for the job.
3) Refine: apply AI‑powered enrichment to elevate clarity, structure, and completeness; preview and copy.

### Key features supporting the goal
- Live prompt generation with model‑specific formatting (Universal Prompt Generator).
- AI enhancement with adjustable enrichment level and quality indicators.
- Model routing/recommendations and multi‑format output support.
- Save prompts (auth-enabled), browse history, and generate secure share links with controls (expiry, password, view limits).
- Production‑ready backend: authentication, quotas and rate limiting, analytics, logging, and health checks.

### Success criteria
- Users consistently obtain better outputs from their chosen AI model using the generated prompts.
- Prompt creation feels fast, guided, and confidence‑inspiring (clear structure, guardrails, helpful defaults).
- Saved prompts are easy to reuse and share securely inside and outside the organization.

### Non‑goals
- Acting as a general chat app or replacing core AI providers.
- Building/hosting custom foundation models.

### Scope summary
- Frontend (React/Vite): prompt builder UI, model selector, enrichment preview, sharing, profile/settings.
- Backend (Express/Supabase/Redis): enrichment API, auth, sharing, quotas/rate limiting, analytics, monitoring.

### Why this matters
Well‑formed prompts meaningfully improve model accuracy, reduce retries, and lower cost. Promptr productizes prompt engineering best practices so more people can achieve expert‑level results, faster.


