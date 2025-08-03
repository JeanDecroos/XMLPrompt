import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Code, 
  ArrowLeft, 
  Search, 
  ChevronRight,
  ChevronDown,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Settings,
  Globe,
  Database,
  Key,
  Shield,
  Cpu,
  Target,
  Lightbulb
} from 'lucide-react'

const DocsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState('getting-started')
  const [copiedCode, setCopiedCode] = useState(null)
  const [expandedSections, setExpandedSections] = useState(['getting-started'])

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      color: 'blue',
      subsections: [
        { id: 'introduction', title: 'Introduction' },
        { id: 'quick-start', title: 'Quick Start Guide' },
        { id: 'basic-concepts', title: 'Basic Concepts' }
      ]
    },
    {
      id: 'prompt-engineering',
      title: 'Prompt Engineering',
      icon: Target,
      color: 'purple',
      subsections: [
        { id: 'prompt-structure', title: 'Prompt Structure' },
        { id: 'best-practices', title: 'Best Practices' },
        { id: 'advanced-techniques', title: 'Advanced Techniques' },
        { id: 'examples', title: 'Examples & Templates' }
      ]
    },
    {
      id: 'ai-models',
      title: 'AI Models',
      icon: Cpu,
      color: 'green',
      subsections: [
        { id: 'model-overview', title: 'Model Overview' },
        { id: 'model-routing', title: 'Smart Model Routing' },
        { id: 'model-comparison', title: 'Model Comparison' },
        { id: 'custom-models', title: 'Custom Models' }
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: Zap,
      color: 'orange',
      subsections: [
        { id: 'enrichment', title: 'Prompt Enrichment' },
        { id: 'sharing', title: 'Prompt Sharing' },
        { id: 'history', title: 'Session History' },
        { id: 'analytics', title: 'Analytics & Insights' }
      ]
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Code,
      color: 'red',
      subsections: [
        { id: 'authentication', title: 'Authentication' },
        { id: 'endpoints', title: 'API Endpoints' },
        { id: 'rate-limits', title: 'Rate Limits' },
        { id: 'webhooks', title: 'Webhooks' }
      ]
    },
    {
      id: 'integration',
      title: 'Integration',
      icon: Globe,
      color: 'indigo',
      subsections: [
        { id: 'javascript-sdk', title: 'JavaScript SDK' },
        { id: 'python-sdk', title: 'Python SDK' },
        { id: 'rest-api', title: 'REST API' },
        { id: 'webhooks-setup', title: 'Webhooks Setup' }
      ]
    }
  ]

  const codeExamples = {
    'javascript-basic': `// Basic prompt generation
import { PromptCraft } from '@promptcraft/sdk';

const client = new PromptCraft({
  apiKey: 'your-api-key'
});

const result = await client.generatePrompt({
  role: 'Marketing Manager',
  task: 'Create a product launch campaign',
  context: 'SaaS productivity tool for teams',
  requirements: 'Focus on benefits, include CTA'
});

console.log(result.prompt);`,

    'python-basic': `# Basic prompt generation
from promptcraft import PromptCraft

client = PromptCraft(api_key="your-api-key")

result = client.generate_prompt(
    role="Marketing Manager",
    task="Create a product launch campaign",
    context="SaaS productivity tool for teams",
    requirements="Focus on benefits, include CTA"
)

print(result.prompt)`,

    'api-curl': `# Generate a prompt via REST API
curl -X POST https://api.promptcraft.ai/v1/prompts/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "Marketing Manager",
    "task": "Create a product launch campaign",
    "context": "SaaS productivity tool for teams",
    "requirements": "Focus on benefits, include CTA",
    "model": "gpt-4",
    "enrichment": true
  }'`
  }

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
      case 'getting-started':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Getting Started</h1>
              <p className="text-lg text-gray-600 mb-6">
                Welcome to PromptCraft AI! This guide will help you create effective AI prompts and get the most out of our platform.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">What is PromptCraft AI?</h3>
              </div>
              <p className="text-blue-800">
                PromptCraft AI is a professional prompt engineering platform that helps you create, optimize, and manage AI prompts for various use cases. Our smart routing system automatically selects the best AI model for your specific task.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Choose Your Role</h3>
                    <p className="text-gray-600">Select a role that matches your use case or create a custom role.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Describe Your Task</h3>
                    <p className="text-gray-600">Clearly describe what you want the AI to accomplish.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Add Context & Requirements</h3>
                    <p className="text-gray-600">Provide additional context and specify any requirements or constraints.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Generate & Refine</h3>
                    <p className="text-gray-600">Generate your prompt and use our enrichment features to optimize it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'prompt-structure':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Prompt Structure</h1>
              <p className="text-lg text-gray-600 mb-6">
                Learn how to structure effective prompts for maximum AI performance.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anatomy of a Good Prompt</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Role Definition</h4>
                  <p className="text-gray-600">Clearly define who the AI should act as.</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                    "You are an experienced marketing manager..."
                  </code>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Task Description</h4>
                  <p className="text-gray-600">Specify exactly what you want the AI to do.</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                    "Create a product launch email campaign..."
                  </code>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Context & Background</h4>
                  <p className="text-gray-600">Provide relevant background information.</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                    "The product is a SaaS tool for project management..."
                  </code>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Requirements & Constraints</h4>
                  <p className="text-gray-600">Specify format, length, style, and other requirements.</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded mt-1 block">
                    "Keep it under 200 words, include a clear CTA..."
                  </code>
                </div>
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">API Reference</h1>
              <p className="text-lg text-gray-600 mb-6">
                Complete reference for the PromptCraft AI REST API.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Key className="w-5 h-5 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-900">Authentication</h3>
              </div>
              <p className="text-yellow-800 mb-4">
                All API requests require authentication using your API key in the Authorization header.
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {copiedCode === 'auth-header' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Endpoints</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Generate Prompt</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">POST</span>
                  </div>
                  <p className="text-gray-600 mb-4">Generate an optimized prompt based on your inputs.</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    POST /v1/prompts/generate
                  </code>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Example Request</h4>
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{codeExamples['api-curl']}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(codeExamples['api-curl'], 'api-curl')}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        {copiedCode === 'api-curl' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'javascript-sdk':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">JavaScript SDK</h1>
              <p className="text-lg text-gray-600 mb-6">
                Official JavaScript/TypeScript SDK for PromptCraft AI.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Installation</h2>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`npm install @promptcraft/sdk`}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('npm install @promptcraft/sdk', 'npm-install')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {copiedCode === 'npm-install' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Usage</h2>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples['javascript-basic']}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(codeExamples['javascript-basic'], 'js-basic')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {copiedCode === 'js-basic' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
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
              <p className="text-gray-600 mt-1">Everything you need to master PromptCraft AI</p>
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