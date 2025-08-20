import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, ChevronRight, ChevronDown, BookOpen, Info, Zap, Target, Lightbulb } from 'lucide-react'

const DocsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('getting-started')
  const [copiedCode, setCopiedCode] = useState(null)
  const [expandedSections, setExpandedSections] = useState(['getting-started'])

  // Reworked user-focused sections
  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      color: 'blue',
      subsections: [
        { id: 'quick-overview', title: 'Quick Start Overview' },
        { id: 'first-prompt', title: 'Creating Your First Prompt' },
        { id: 'model-routing', title: 'Using AI Model Routing' }
      ]
    },
    {
      id: 'building-prompts',
      title: 'Building Prompts (Best Practices)',
      icon: Target,
      color: 'purple',
      subsections: [
        { id: 'anatomy', title: 'Anatomy of a Great Prompt' },
        { id: 'tips', title: 'Tips & Pitfalls' },
        { id: 'formats', title: 'Output Formatting Options' }
      ]
    },
    {
      id: 'models',
      title: 'Models & Recommendations',
      icon: Zap,
      color: 'green',
      subsections: [
        { id: 'choose-model', title: 'Choosing a model' },
        { id: 'recommendations', title: 'Recommendations Explained' },
        { id: 'limitations', title: 'Current Limitations' }
      ]
    },
    {
      id: 'enrichment',
      title: 'Enrichment (Pro)',
      icon: Zap,
      color: 'orange',
      subsections: [
        { id: 'what-it-does', title: 'What enrichment does' },
        { id: 'levels', title: 'Enhancement Levels' },
        { id: 'limits-errors', title: 'Limits & Errors' },
        { id: 'free-vs-pro', title: 'Free vs Pro' }
      ]
    },
    {
      id: 'saving-sharing',
      title: 'Saving & Sharing',
      icon: BookOpen,
      color: 'indigo',
      subsections: [
        { id: 'saving', title: 'Save Prompts' },
        { id: 'export', title: 'Export & Copy' },
        { id: 'share', title: 'Share Prompts' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: Info,
      color: 'red',
      subsections: [
        { id: 'common', title: 'Common Issues' },
        { id: 'quick-fixes', title: 'Quick Fixes' },
        { id: 'support', title: 'Support' }
      ]
    }
  ]

  const codeExamples = {}

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const renderContent = () => {
    switch (selectedSection) {
      /* Getting Started */
      case 'quick-overview':
        return (
          <div className="space-y-6 text-gray-800 leading-relaxed max-w-6xl">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quick Start Overview</h1>
              <p className="max-w-3xl">Follow this 3‑step flow to get a strong prompt fast. Each step mirrors the live Builder and uses the same terminology and layout.</p>
            </div>

            <img src="/images/builder-overview.svg" alt="Builder Overview" className="w-full max-w-2xl mx-auto rounded-xl border border-gray-300 mb-4"/>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900 text-lg">1) Build</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><b>Role</b> sets tone and vocabulary (e.g., Marketing Specialist, Software Developer).</li>
                  <li><b>Task</b> is the deliverable in <b>2–4 sentences</b>; specify length, audience, or bullets/paragraphs.</li>
                  <li><b>Context</b> adds helpful background (brand voice, examples); keep it concise.</li>
                  <li><b>Requirements</b> list testable constraints: format, tone, length, key points.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900 text-lg">2) Choose Model</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use the recommendation beneath the selector as a default.</li>
                  <li>Writing → <b>GPT‑4o</b> or <b>Claude 3.5 Sonnet</b>.</li>
                  <li>Analysis → <b>Claude 3.5 Sonnet</b>. Code/tech → <b>Claude 3.5 Sonnet</b> or <b>GPT‑4o</b>.</li>
                  <li>Cost/speed → try a lighter option; you can switch anytime and regenerate.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900 text-lg">3) Enhance (Pro)</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Enhancement adds context, clarifies requirements, and polishes tone/structure.</li>
                  <li>Levels: Minimal (light clean‑up), Balanced (comprehensive), Advanced (polished).</li>
                  <li>Preview shows changes; copy/export/share when ready.</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">Before you start</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Know your <b>audience</b> and the <b>goal</b> of the output.</li>
                  <li>Gather 1–2 concrete examples or references (optional, helpful).</li>
                  <li>Decide how you’ll <b>measure a good result</b> (length, tone, bullets, structure).</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">Common mistakes</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Task too vague (“write about…”) → make it specific with length and audience.</li>
                  <li>Context too long → trim unrelated background; keep only essentials.</li>
                  <li>Conflicting requirements → remove contradictions; keep constraints testable.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm max-w-4xl mx-auto">
              <h3 className="font-semibold mb-3 text-gray-900">Example (end‑to‑end)</h3>
              <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`Role: Marketing Specialist\nTask: Write a 150‑word product description for [Product] aimed at team leads. Highlight 3 benefits (bullets) and finish with a single CTA.\nContext: B2B productivity; friendly, professional voice; avoid jargon.\nRequirements: Use bullet points for benefits; end with a one‑sentence CTA.`}</pre>
            </div>
          </div>
        )
      case 'first-prompt':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Creating Your First Prompt</h1>
              <p className="max-w-3xl">Use the Builder’s left panel to collect high‑signal inputs. Start small; iterate quickly. Each edit is cheap—increase clarity, regenerate, compare.</p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Step‑by‑step</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li><b>Choose a role</b> that fits your use case (e.g., Marketing Specialist, Software Developer).</li>
                <li><b>Write the task</b> in 2–4 sentences. State deliverable, audience, and style (bullets/paragraphs/tone).</li>
                <li><b>Add context</b> for background and examples; keep it concise (3–6 lines).</li>
                <li><b>List requirements</b> that are testable: format, tone, length, key points.</li>
                <li><b>Generate</b> → review the preview → <b>edit</b> → regenerate as needed.</li>
              </ol>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">Good vs Bad (Task)</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-green-700">Good</div>
                    <p>Draft a 6‑bullet “What’s new” section for our release notes aimed at engineers. Keep bullets concise; include one code‑related example.</p>
                  </div>
                  <div>
                    <div className="font-medium text-red-700">Bad</div>
                    <p>Write release notes.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">Length guidance</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Task: 2–4 sentences is ideal.</li>
                  <li>Context: keep to the essentials (3–6 lines). Link to references when possible.</li>
                  <li>Requirements: use 1–6 concise bullets; avoid dense paragraphs.</li>
                </ul>
                  </div>
                </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Iterate</h3>
              <p className="text-sm">If the preview misses the mark, improve the task with a clearer outcome, add 1–2 constraints, or trim unnecessary context. Small changes → regenerate → compare.</p>
                  </div>
                </div>
        )
      case 'model-routing':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Using AI Model Routing</h1>
              <p className="max-w-3xl">We suggest a balanced default based on your role and task. Treat it as a helpful starting point—you always control the final choice.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">Task → Model quick map</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Writing & marketing → <b>GPT‑4o</b> or <b>Claude 3.5 Sonnet</b></li>
                  <li>Analysis & research → <b>Claude 3.5 Sonnet</b></li>
                  <li>Technical/code → <b>Claude 3.5 Sonnet</b> or <b>GPT‑4o</b></li>
                  <li>Cost/speed constraints → try lighter options</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-3 text-gray-900">When to override</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>You prefer a model for similar tasks (experience matters).</li>
                  <li>You need faster/cheaper runs for iteration.</li>
                  <li>Your task leans more technical or more creative than average.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Evaluate output</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Does it address the exact task and audience?</li>
                <li>Does it follow constraints (length, bullets, tone)?</li>
                <li>Refine task/requirements or switch models; regenerate and compare.</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <p className="text-yellow-800 text-sm">Note: Recommendations are suggestions, not guarantees. Availability may vary across providers.</p>
            </div>
          </div>
        )

      /* Building Prompts */
      case 'anatomy':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Anatomy of a Great Prompt</h1>
              <p className="max-w-3xl">A great prompt is short, specific, and testable. Use this structure every time. Fill what you need and keep the rest minimal.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Fields & best practices</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><b>Role</b>: set an identity matching the task (e.g., “Marketing Specialist”). <i>Question</i>: who produces this in real life?</li>
                  <li><b>Task</b>: state the deliverable in <b>2–4 sentences</b>. Include audience, tone and length. <i>Question</i>: what must be produced?</li>
                  <li><b>Context</b>: essential background (audience, example links, brand voice). 3–6 lines is enough. <i>Question</i>: what facts change the output?</li>
                  <li><b>Requirements</b>: testable constraints (format, bullets/paragraphs, sections, CTA, word limits). <i>Question</i>: how do we know it’s correct?</li>
                  <li><b>Output format</b>: plain, JSON, Markdown. Choose based on how you’ll use the result.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Length guidance</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><b>Task</b>: 2–4 sentences.</li>
                  <li><b>Context</b>: 3–6 lines (trim unrelated background).</li>
                  <li><b>Requirements</b>: 1–6 bullets; avoid dense paragraphs.</li>
                  <li>Prefer clarity over quantity. Small edits + regenerate often beat long descriptions.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Fully assembled example</h3>
              <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`Role: Product Marketing Manager\nTask: Write a 150‑word product description for [Product] aimed at team leads. Use 3 bullet points for benefits and end with a single CTA.\nContext: B2B productivity tool; friendly, professional voice; avoid jargon.\nRequirements:\n- 150 words (±10%)\n- 3 bullet benefits\n- End with 1 concise CTA\n- No hype claims`}</pre>
            </div>
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tips & Pitfalls</h1>
              <p className="max-w-3xl">Use these quick diagnostics when an output isn’t what you expect.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Do</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>State the deliverable, audience, and length in the task.</li>
                  <li>Prefer bullet requirements over dense paragraphs.</li>
                  <li>Give one short example or reference if helpful.</li>
                  <li>Iterate: small edits → regenerate → compare.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Avoid</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Vague “write about X”. Be explicit.</li>
                  <li>Overloading context. Keep only what changes the output.</li>
                  <li>Contradictory constraints (e.g., “formal and casual”).</li>
                  <li>Embedding sensitive data in prompts you’ll share.</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">If X happens → Try Y</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><b>Too generic</b> → Add audience, length, and 2–3 concrete constraints.</li>
                <li><b>Wanders off topic</b> → Trim context; add a one‑sentence goal.</li>
                <li><b>Too long</b> → Set a clear word/section limit in requirements.</li>
                <li><b>Wrong tone</b> → Specify tone and provide a sentence in that tone.</li>
              </ul>
            </div>
          </div>
        )
      case 'formats':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Output Formatting Options</h1>
              <p className="max-w-3xl">Choose the format based on how you’ll use the result. If unsure, start with plain text and only switch when you need structure.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Plain text</h3>
                <p className="text-sm">Best for reading/pasting. Keep a crisp structure with headings or bullets.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`- Benefit 1\n- Benefit 2\nCTA: Start your trial → [link]`}</pre>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">JSON</h3>
                <p className="text-sm">Use when another system will parse the output. Keep keys simple.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`{\n  "title": "Product description",\n  "bullets": ["Benefit 1", "Benefit 2", "Benefit 3"],\n  "cta": "Start your trial"\n}`}</pre>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Markdown</h3>
                <p className="text-sm">Good for docs or chat apps. Use fenced code for snippets.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`## Features\n- Fast setup\n- Team collaboration\n\n\`\`\`bash\n# install\nnpm i your-package\n\`\`\``}</pre>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Choosing quickly</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Human‑readable and quick → <b>Plain</b></li>
                <li>Programmatic use → <b>JSON</b></li>
                <li>Documentation / chat systems → <b>Markdown</b></li>
              </ul>
            </div>
          </div>
        )

      /* Models & Recommendations */
      case 'choose-model':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choosing a Model</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Start with the recommendation shown under the selector. If you have a strong preference (speed, cost, tone), use the quick chooser below and switch. You can always regenerate and compare.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-indigo-200">
                <h3 className="font-semibold mb-1 text-gray-900">Writing & Marketing</h3>
                <p className="text-sm">Balanced creativity and structure.</p>
                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                  <li><b>GPT‑4o</b> or <b>Claude 3.5 Sonnet</b></li>
                  <li>Great for emails, descriptions, web copy</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-purple-200">
                <h3 className="font-semibold mb-1 text-gray-900">Analysis & Reasoning</h3>
                <p className="text-sm">Summaries, comparisons, lightweight research.</p>
                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                  <li><b>Claude 3.5 Sonnet</b></li>
                  <li>Clear step‑by‑step outputs</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-blue-200">
                <h3 className="font-semibold mb-1 text-gray-900">Technical / Code</h3>
                <p className="text-sm">Engineering docs, bug triage, code‑adjacent text.</p>
                <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                  <li><b>Claude 3.5 Sonnet</b> or <b>GPT‑4o</b></li>
                  <li>Prefer concise, testable requirements</li>
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-indigo-900">Decision rules</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-indigo-900/90">
                <li><b>Need speed/cost</b> → choose a lighter option and shorten the task.</li>
                <li><b>Need polish</b> → keep the default recommendation and refine requirements.</li>
                <li><b>Mixed tasks</b> (e.g., write + small table) → any recommended model; be explicit about sections.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Example scenarios</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><b>Product description</b> → GPT‑4o or Claude 3.5 Sonnet; ask for 3 bullets + CTA.</li>
                <li><b>Competitor comparison</b> → Claude 3.5 Sonnet; request a 2‑column bullet list.</li>
                <li><b>Bug report synthesis</b> → Claude 3.5 Sonnet; include steps, expected/actual, env.</li>
              </ul>
            </div>
          </div>
        )
      case 'recommendations':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recommendations Explained</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">We suggest a default model based on <b>visible inputs</b> you provide. Think of it as a strong starting point. You always have full control to override and regenerate.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-blue-900">Signals we consider</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-blue-900/90">
                  <li><b>Role</b> (e.g., Marketing Specialist vs Software Developer)</li>
                  <li><b>Task text</b> (hints: write, summarize, analyze, technical)</li>
                  <li><b>Context length</b> (very long contexts benefit from concise models)</li>
                  <li><b>Requirements</b> (tables, bullets, tone, word limits)</li>
                </ul>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-rose-900">What we don’t use</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-rose-900/90">
                  <li>No private account data</li>
                  <li>No external browsing</li>
                  <li>No hidden training signals—only what you type in the Builder</li>
                </ul>
              </div>
                  </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 shadow-sm">
              <p className="text-yellow-900 text-sm">Reminder: recommendations are suggestions, not guarantees. If an output misses the mark, tweak your task/requirements or try another model and compare.</p>
                    </div>
                  </div>
        )
      case 'limitations':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Current Limitations</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">These constraints apply today and may change as providers update their models.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-amber-900">Model & platform</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/90">
                  <li>Availability and rate limits can vary.</li>
                  <li>Latency and cost differ per model and provider.</li>
                  <li>Outputs are non‑deterministic; small rephrases can change results.</li>
                </ul>
                </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-indigo-900">Prompt & output</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-indigo-900/90">
                  <li>Very long context may exceed token limits—trim to essentials.</li>
                  <li>Strict JSON may need light post‑editing; add clear keys and examples.</li>
                  <li>Safety filters can refuse sensitive requests; reframe to a compliant task.</li>
                </ul>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-emerald-900">Practical workarounds</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-900/90">
                <li>Reduce length, split tasks, or generate sections separately.</li>
                <li>Use requirements to make outputs testable (length, bullets, sections).</li>
                <li>Regenerate with small edits; compare and keep the best parts.</li>
              </ul>
            </div>
          </div>
        )

      /* Enrichment (Pro) */
      case 'what-it-does':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">What Enrichment Does</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Enrichment refines the prompt you wrote. It keeps your intent but removes ambiguity, adds missing detail, and structures the output so models perform more consistently. You stay in control—review the refined version in the preview before you copy or export.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-purple-200">
                <h3 className="font-semibold mb-2 text-gray-900">Clarifies intent</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Resolves vague phrases (e.g., “make it better”).</li>
                  <li>Spells out audience, tone, and length.</li>
                  <li>Turns soft requests into testable constraints.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-indigo-200">
                <h3 className="font-semibold mb-2 text-gray-900">Adds helpful context</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Brings missing but implied details to the surface.</li>
                  <li>Keeps the background concise to avoid drift.</li>
                  <li>Suggests examples only when they increase signal.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-blue-200">
                <h3 className="font-semibold mb-2 text-gray-900">Improves structure & tone</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Organizes requirements as crisp bullets or sections.</li>
                  <li>Normalizes voice (e.g., friendly, professional).</li>
                  <li>Honors word limits and formatting choices.</li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Before</h3>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`Role: Marketer\nTask: Write about our new project tool.\nContext: B2B.\nRequirements: Sounds good.`}</pre>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">After (Enriched)</h3>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`Role: Product Marketing Manager\nTask: Draft a 150‑word product description for our project management tool aimed at busy team leads. Use 3 concise bullet benefits and finish with a single CTA.\nContext: B2B; friendly, professional voice; avoid jargon.\nRequirements:\n- 150 words (±10%)\n- 3 benefit bullets (time‑saving, collaboration, visibility)\n- End with one CTA sentence`}</pre>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
              <p className="text-sm text-indigo-900/90">Subtle but important: enrichment makes prompts easier to reuse across teams and models. Many users find they iterate less and copy the result straight into their workflows.</p>
            </div>
          </div>
        )
      case 'levels':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enhancement Levels</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Pick a level based on the importance of the task. You can switch levels and regenerate to compare. A useful default is <b>Balanced</b>.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-blue-900 mb-1">Minimal</h3>
                <p className="text-sm mb-2 text-blue-900/90">Light clean‑up for speed.</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-blue-900/90">
                  <li>Fixes clarity, keeps your wording</li>
                  <li>Normalizes sections and length hints</li>
                  <li><b>Best for</b>: quick drafts, early exploration</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-purple-900 mb-1">Balanced</h3>
                <p className="text-sm mb-2 text-purple-900/90">Comprehensive improvement.</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-purple-900/90">
                  <li>Clarifies task, adds essential context</li>
                  <li>Turns soft asks into testable requirements</li>
                  <li><b>Best for</b>: production‑quality prompts</li>
                </ul>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-indigo-900 mb-1">Advanced</h3>
                <p className="text-sm mb-2 text-indigo-900/90">Polish for important outputs.</p>
                <ul className="list-disc pl-5 text-sm space-y-1 text-indigo-900/90">
                  <li>Stronger tone control and structure</li>
                  <li>Optimizes for readability and reuse</li>
                  <li><b>Best for</b>: external‑facing content</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Start with <b>Balanced</b>; step down to <b>Minimal</b> if you want faster iteration.</li>
                <li>Use <b>Advanced</b> when tone and phrasing matter (web copy, emails).</li>
                <li>If output drifts, simplify context and keep requirements explicit.</li>
              </ul>
            </div>
          </div>
        )
      case 'limits-errors':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Limits & Errors</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Enrichment works best with concise, high‑signal inputs. If you hit a limit or see an error, these fixes usually resolve it.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-amber-900">Common constraints</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/90">
                  <li><b>Token/length</b>: extremely long context can exceed limits—trim to essentials.</li>
                  <li><b>Ambiguity</b>: vague tasks reduce quality—state deliverable, audience, and length.</li>
                  <li><b>Strict JSON</b>: highly structured outputs may need light post‑editing—keep keys simple.</li>
                  <li><b>Safety</b>: sensitive topics may be declined—reframe to a compliant objective.</li>
                </ul>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-emerald-900">Quick fixes</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-900/90">
                  <li>Reduce or link to background instead of pasting it verbatim.</li>
                  <li>Move examples into 1–2 short lines; keep only what changes the output.</li>
                  <li>Change level: if hitting limits, try <b>Minimal</b> or tighten requirements.</li>
                  <li>Retry on transient network/provider errors.</li>
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
              <p className="text-sm text-indigo-900/90">If you see inconsistent results, iterate in small steps—adjust one field (task, requirements, or level), regenerate, and compare. Most users reach a great result in 1–2 cycles.</p>
            </div>
          </div>
        )
      case 'free-vs-pro':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Free vs Pro</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Both plans use the same Builder. Pro adds enrichment so you get consistent, reuse‑ready prompts with fewer iterations.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Free</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Structured prompt generation</li>
                  <li>Preview, copy, and export</li>
                  <li>All visible models selectable</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3"><b>Great for</b>: learning the workflow, one‑off tasks, and quick drafts.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 shadow-sm">
                <div className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200 mb-2">Pro</div>
                <h3 className="font-semibold text-purple-900 mb-2">Pro</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-purple-900/90">
                  <li>AI Enrichment with <b>Minimal</b>, <b>Balanced</b>, and <b>Advanced</b> levels</li>
                  <li>Cleaner prompts that re‑use well across models and teams</li>
                  <li>Fewer iterations to reach a publish‑ready result</li>
                </ul>
                <p className="text-sm text-purple-900/90 mt-3"><b>Great for</b>: teams, client‑facing content, and workflows where consistency matters.</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
              <p className="text-sm text-indigo-900/90">Most people start free and upgrade when they notice they’re refining the same kinds of prompts repeatedly. Pro simply gets you to a dependable result faster—no pressure.</p>
              <div className="mt-3">
                <Link to="/pricing" className="text-indigo-700 hover:text-indigo-900 text-sm">See pricing</Link>
              </div>
            </div>
          </div>
        )

      /* Saving & Sharing */
      case 'saving':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Save Prompts</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Save prompts you want to reuse or share later. Saving keeps your current fields (role, task, context, requirements), selected model, and—if you’re Pro—the chosen enrichment level.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">How to save</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>Fill in your prompt fields and generate the preview.</li>
                  <li>Click <b>Save</b> in the preview actions.</li>
                  <li>Name your prompt so it’s easy to find later.</li>
                </ol>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-indigo-900">Where to find saved prompts</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-indigo-900/90">
                  <li>Open <b>Prompt History</b> from the Builder or your profile.</li>
                  <li>Use search to filter by title.</li>
                  <li>Open any saved prompt to duplicate or rename.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">What’s stored</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Role, Task, Context, Requirements</li>
                <li>Selected model and (if Pro) enrichment level</li>
                <li>Timestamp; internal ID to support sharing</li>
              </ul>
            </div>
          </div>
        )
      case 'export':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Export & Copy</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Use <b>Copy</b> for a quick paste, or <b>Export</b> to download a file for your repository, docs, or automation.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Plain text (.txt)</h3>
                <p className="text-sm">Best for pasting into chat or email.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`Role: Marketing Specialist\nTask: Write a 150‑word product description...\nRequirements: 3 bullets; 1 CTA`}</pre>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">JSON (.json)</h3>
                <p className="text-sm">Use for programmatic workflows.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`{\n  "role": "Marketing Specialist",\n  "task": "150‑word description with 3 bullets and a CTA",\n  "requirements": ["3 bullets", "1 CTA"],\n  "model": "Claude 3.5 Sonnet"\n}`}</pre>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Markdown (.md)</h3>
                <p className="text-sm">Good for docs and wikis.</p>
                <pre className="text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">{`## Prompt\n**Role:** Marketing Specialist\n**Task:** 150‑word description with 3 bullets and a CTA\n**Requirements:**\n- 3 benefit bullets\n- 1 CTA`}</pre>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-emerald-900">Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-900/90">
                <li>When exporting JSON, keep keys simple and consistent across prompts.</li>
                <li>For Markdown, use fenced code for examples to keep formatting intact.</li>
                <li>Use filenames that match the prompt title for easy search.</li>
              </ul>
            </div>
          </div>
        )
      case 'share':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Share Prompts</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Create a share link so teammates can view the prompt settings and preview. Sharing is view‑only—recipients can’t edit your saved prompt.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Create a link</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>Open a saved prompt (from Prompt History or preview).</li>
                  <li>Click <b>Share</b>.</li>
                  <li>Generate the link and copy it.</li>
                </ol>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-blue-900">Manage access</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-blue-900/90">
                  <li>Links are view‑only; recipients see role, task, context, requirements, and preview.</li>
                  <li>Revoke a link from the same Share dialog or Prompt History.</li>
                  <li>For sensitive data, prefer exporting and sharing internally.</li>
                </ul>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-rose-900">Best practices</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-rose-900/90">
                <li>Remove private or identifying data before sharing.</li>
                <li>Use placeholders like <code>[Company]</code> or <code>[Feature]</code> in public links.</li>
                <li>Keep prompts reusable—lean on requirements and keep context concise.</li>
              </ul>
            </div>
          </div>
        )

      /* Troubleshooting */
      case 'common':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Common Issues</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">Most problems are quick to resolve. Start with the checks below—each card lists symptoms and likely causes.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-1">No output in preview</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><b>Symptoms</b>: empty preview or placeholder stays visible.</li>
                  <li><b>Likely causes</b>: required fields missing; context too long; transient network issue.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-1">Enhancement button disabled</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><b>Symptoms</b>: Enhance (Pro) not clickable.</li>
                  <li><b>Likely causes</b>: free tier; missing task/role; hitting length/token limits.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-1">Model unavailable</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><b>Symptoms</b>: selector shows unavailable or request fails.</li>
                  <li><b>Likely causes</b>: provider outage or temporary rate limit.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm border-t-4 border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-1">Output drifts off topic</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><b>Symptoms</b>: long or unfocused results.</li>
                  <li><b>Likely causes</b>: context too long; vague task; conflicting requirements.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-gray-900">Quick diagnostics</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Confirm required fields: <b>Role</b> and a clear <b>Task</b> in 2–4 sentences.</li>
                <li>Trim context to essentials (3–6 lines); move details to requirements.</li>
                <li>Set testable constraints: word limit, bullets vs paragraphs, tone.</li>
                <li>Retry once; if it persists, try another model.</li>
              </ul>
            </div>
          </div>
        )
      case 'quick-fixes':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quick Fixes</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">A short checklist that resolves most cases.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-emerald-900">Checklist</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-900/90">
                  <li>Fill required fields and keep the task to 2–4 sentences.</li>
                  <li>Reduce context length; keep only what changes the output.</li>
                  <li>Add 2–3 bullet <b>Requirements</b> (length, sections, tone).</li>
                  <li>Switch model if speed/cost/reasoning needs differ.</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">If X → Try Y</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li><b>Empty preview</b> → check required fields; retry; try another model.</li>
                  <li><b>Enhance disabled</b> → upgrade to Pro or shorten inputs; verify role/task present.</li>
                  <li><b>JSON invalid</b> → reduce complexity; add a minimal example schema.</li>
                  <li><b>Off‑topic</b> → trim context; add a one‑sentence goal to the task.</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-2 text-blue-900">Hard refresh & cache</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-blue-900/90">
                <li>Hard refresh the page (Cmd+Shift+R).</li>
                <li>Disable aggressive browser extensions for this tab if requests are blocked.</li>
                <li>Try in a private window to rule out cached state.</li>
              </ul>
            </div>
          </div>
        )
      case 'support':
        return (
          <div className="space-y-8 text-gray-800 leading-relaxed">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded mt-2" />
              <p className="max-w-3xl mt-3">We’re here to help. Email us and include enough detail to reproduce the issue so we can respond quickly.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Contact</h3>
                <p className="text-sm">Email: <a className="text-indigo-700 hover:text-indigo-900" href="mailto:support@promptr.com">support@promptr.com</a></p>
                <p className="text-xs text-gray-500 mt-2">No live chat or community server yet.</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-2 text-indigo-900">Include in your message</h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-indigo-900/90">
                  <li>Short description and steps to reproduce</li>
                  <li>Screenshot and the time it happened</li>
                  <li>Saved prompt title or share link (if applicable)</li>
                  <li>Browser and OS</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">Select a documentation section</h2>
            <p className="text-gray-500">Choose a topic from the sidebar to get started.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 docs">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to App
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
                              <p className="text-gray-600 mt-1">Everything you need to master Promptr</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {docSections.map((section) => {
                  const Icon = section.icon
                  const isExpanded = expandedSections.includes(section.id)
                  
                  return (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <Icon className={`w-4 h-4 mr-2 text-${section.color}-600`} />
                          <span className="font-medium">{section.title}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {section.subsections.map((subsection) => (
                            <button
                              key={subsection.id}
                              onClick={() => setSelectedSection(subsection.id)}
                              className={`block w-full text-left px-3 py-1 text-sm rounded-lg transition-colors ${
                                selectedSection === subsection.id
                                  ? `bg-${section.color}-50 text-${section.color}-700`
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {subsection.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocsPage 