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
        { id: 'templates', title: 'Copyable Templates' },
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
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quick Start Overview</h1>
            <p className="text-gray-700">Promptr helps you go from a simple idea to a high‑quality prompt in three steps: Build → Choose Model → Enhance.</p>
            <img src="/images/builder-overview.svg" alt="Builder Overview" className="w-full rounded-xl border border-gray-200"/>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li><b>Build</b>: Set your role, describe the task in 2–4 sentences, add concise context and any must‑have requirements.</li>
              <li><b>Choose Model</b>: We suggest a balanced model; you can override anytime and regenerate.</li>
              <li><b>Enhance (Pro)</b>: Improve structure, tone and clarity. Review changes in the preview, then copy/export/share.</li>
            </ol>
          </div>
        )
      case 'first-prompt':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Creating Your First Prompt</h1>
            <h3 className="font-semibold">1) Choose a role</h3>
            <p className="text-gray-700">The role guides tone and vocabulary. Examples: <i>Marketing Specialist</i>, <i>Software Developer</i>, <i>Data Analyst</i>.</p>
            <h3 className="font-semibold">2) Describe your task</h3>
            <p className="text-gray-700">Aim for 2–4 sentences. Be specific about the deliverable and constraints. Bad: “Write about our app.” Good: “Write a 150‑word product description highlighting benefits for managers.”</p>
            <h3 className="font-semibold">3) Add context & requirements</h3>
            <p className="text-gray-700">Include audience, brand voice, key points, do/don'ts. Keep it concise; trim long background.</p>
            <h3 className="font-semibold">4) Generate & review</h3>
            <p className="text-gray-700">View the preview on the right. Copy/export immediately or use Pro enrichment to refine.</p>
          </div>
        )
      case 'model-routing':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Using AI Model Routing</h1>
            <p className="text-gray-700">The suggestion you see next to the selector is based on your role and task. It’s a starting point—not a rule.</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><b>Where to see it:</b> under the Model selector, with a short reason.</li>
              <li><b>Why this model?</b> Balanced choice for your task (e.g., writing vs analysis vs code).</li>
              <li><b>Override:</b> pick another model for speed/cost or personal preference and regenerate.</li>
            </ul>
          </div>
        )

      /* Building Prompts */
      case 'anatomy':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Anatomy of a Great Prompt</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><b>Role</b>: who the AI should be</li>
              <li><b>Task</b>: clear objective (2–4 sentences)</li>
              <li><b>Context</b>: background, audience, examples (optional)</li>
              <li><b>Requirements</b>: must‑haves, constraints, output style</li>
              <li><b>Output format</b>: plain, JSON, Markdown etc.</li>
            </ul>
          </div>
        )
      case 'templates':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Copyable Templates</h1>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Marketing Email</h3>
              <pre className="text-sm bg-white border border-gray-200 rounded p-3 overflow-auto">{`Role: Marketing Specialist\nTask: Write a 120–150 word product launch email introducing [Product].\nContext: Audience = busy team leads. Include 1 benefit and a single CTA.\nRequirements: Friendly, crisp tone. Avoid jargon.`}</pre>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Product Description</h3>
              <pre className="text-sm bg-white border border-gray-200 rounded p-3 overflow-auto">{`Role: Content Writer\nTask: Create a 120‑word description for [Product] highlighting 3 benefits.\nContext: Website product page; B2B audience.\nRequirements: Use bullet points; end with value summary.`}</pre>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Bug Report</h3>
              <pre className="text-sm bg-white border border-gray-200 rounded p-3 overflow-auto">{`Role: Software Developer\nTask: Draft a reproducible bug report for [Issue].\nContext: Provide steps, expected vs actual, logs if any.\nRequirements: Clear headings; neutral tone.`}</pre>
            </div>
          </div>
        )
      case 'tips':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Tips & Pitfalls</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Be specific; avoid ambiguity.</li>
              <li>Aim for 2–4 sentences for the task.</li>
              <li>Trim long context; keep only what’s necessary.</li>
              <li>Use lists for requirements; avoid dense paragraphs.</li>
              <li>Review and iterate—small edits often help more than long context.</li>
            </ul>
          </div>
        )
      case 'formats':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Output Formatting Options</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><b>Plain</b>: general use; fastest to iterate.</li>
              <li><b>JSON</b>: when you want fields to parse programmatically.</li>
              <li><b>Markdown</b>: nicely formatted text; use fenced code for snippets.</li>
            </ul>
          </div>
        )

      /* Models & Recommendations */
      case 'choose-model':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Choosing a Model</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Writing: GPT‑4o or Claude 3.5 Sonnet</li>
              <li>Analysis: Claude 3.5 Sonnet</li>
              <li>Technical/Code: Claude 3.5 Sonnet or GPT‑4o</li>
              <li>Cost/Speed: try a lighter option</li>
            </ul>
          </div>
        )
      case 'recommendations':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Recommendations Explained</h1>
            <p className="text-gray-700">We look at visible inputs (role and task) to suggest a balanced model. It’s a nudge, not a rule. You can switch anytime and regenerate.</p>
          </div>
        )
      case 'limitations':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Current Limitations</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Model availability can change.</li>
              <li>Recommendations are suggestions; pick what works best for you.</li>
              <li>Very long inputs may exceed token limits—shorten context.</li>
            </ul>
          </div>
        )

      /* Enrichment (Pro) */
      case 'what-it-does':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">What Enrichment Does</h1>
            <p className="text-gray-700">Enhancement adds missing context, clarifies requirements, and improves structure/tone. You see a refined prompt ready to copy or export.</p>
          </div>
        )
      case 'levels':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Enhancement Levels</h1>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="font-semibold mb-1">Minimal</h3><p className="text-sm text-gray-700">Basic structure and clarity fixes.</p></div>
              <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="font-semibold mb-1">Balanced</h3><p className="text-sm text-gray-700">Comprehensive improvement (default).</p></div>
              <div className="bg-white border border-gray-200 rounded-lg p-4"><h3 className="font-semibold mb-1">Advanced</h3><p className="text-sm text-gray-700">Professional optimization for important outputs.</p></div>
            </div>
          </div>
        )
      case 'limits-errors':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Limits & Errors</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Token/length: reduce context or lower level if you hit limits.</li>
              <li>Network errors: retry; ensure the backend is running.</li>
            </ul>
          </div>
        )
      case 'free-vs-pro':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Free vs Pro</h1>
            <p className="text-gray-700">Free = structure‑only generation; Pro = AI‑enhanced refinement with levels and higher limits.</p>
          </div>
        )

      /* Saving & Sharing */
      case 'saving':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Save Prompts</h1>
            <p className="text-gray-700">Use the Save action in the preview. Saved prompts appear in your account (if enabled). Rename or duplicate from there.</p>
          </div>
        )
      case 'export':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Export & Copy</h1>
            <p className="text-gray-700">Export to .txt/.json/.xml/.yaml/.md. For Markdown, surround with fenced code (```lang). Choose JSON when you need structured fields.</p>
          </div>
        )
      case 'share':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Share Prompts</h1>
            <p className="text-gray-700">Create a link to share. Public links are viewable by anyone with the URL; for private sharing, only share with trusted contacts.</p>
          </div>
        )

      /* Troubleshooting */
      case 'common':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Common Issues</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>No output in preview</li>
              <li>Enhancement button disabled</li>
              <li>Model unavailable</li>
            </ul>
          </div>
        )
      case 'quick-fixes':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Quick Fixes</h1>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Complete required fields</li>
              <li>Reduce length or split the task</li>
              <li>Try a different model</li>
              <li>Check your network/back‑end status</li>
            </ul>
          </div>
        )
      case 'support':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-700">Email: support@promptr.com</p>
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
    <div className="min-h-screen bg-gray-50">
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