import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  ChevronDown, 
  ChevronRight,
  Search,
  Lightbulb,
  Users,
  Zap,
  Target,
  Settings,
  Crown,
  ArrowLeft
} from 'lucide-react'

const HelpPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('getting-started')

  const faqData = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create my first prompt?',
      answer: 'Start by selecting a role that matches your use case, then describe your task clearly. Add context and requirements to help the AI understand what you need. Finally, choose the appropriate AI model and click "Generate Prompt".'
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What makes a good prompt?',
      answer: 'Good prompts are specific, clear, and provide context. Include your role, the task you want to accomplish, any constraints or requirements, and the desired output format. The more specific you are, the better results you\'ll get.'
    },
    {
      id: 3,
      category: 'features',
      question: 'How does prompt enrichment work?',
      answer: 'Prompt enrichment uses AI to automatically improve your basic prompts by adding context, examples, and optimization techniques. Pro users get access to advanced enrichment powered by GPT-4.'
    },
    {
      id: 4,
      category: 'features',
      question: 'Can I share my prompts with others?',
      answer: 'Yes! You can share prompts publicly or privately. Pro users can password-protect their shared prompts and set expiration dates for enhanced security.'
    },
    {
      id: 5,
      category: 'models',
      question: 'Which AI model should I choose?',
      answer: 'Our smart routing system automatically suggests the best model based on your task. GPT-4 is great for complex reasoning, Claude for analysis, and Gemini for creative tasks. Each model has different strengths.'
    },
    {
      id: 6,
      category: 'models',
      question: 'What\'s the difference between AI models?',
      answer: 'Different models excel at different tasks: GPT-4 for reasoning and code, Claude for analysis and safety, Gemini for creativity and multimodal tasks, and specialized models for specific use cases like image generation or code completion.'
    },
    {
      id: 7,
      category: 'account',
      question: 'What are the differences between Free and Pro?',
      answer: 'Free users get 100 prompt generations and 20 enrichments per month. Pro users get 1000 generations, 500 enrichments, advanced features like password-protected sharing, priority support, and access to premium AI models.'
    },
    {
      id: 8,
      category: 'account',
      question: 'How do I upgrade to Pro?',
      answer: 'Click the "Upgrade to Pro" button in your account menu or visit the pricing section. Pro subscriptions are billed monthly and can be cancelled anytime.'
    },
    {
      id: 9,
      category: 'troubleshooting',
      question: 'Why isn\'t my prompt working?',
      answer: 'Check that you\'ve filled in the required fields (role and task). Make sure your prompt is specific enough and try using the enrichment feature to improve it. If issues persist, try a different AI model.'
    },
    {
      id: 10,
      category: 'troubleshooting',
      question: 'I\'m hitting usage limits, what can I do?',
      answer: 'Free users have monthly limits that reset each month. You can upgrade to Pro for higher limits, or wait for your limits to reset. Pro users have much higher limits and priority access.'
    }
  ]

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: Lightbulb, color: 'blue' },
    { id: 'features', name: 'Features', icon: Zap, color: 'purple' },
    { id: 'models', name: 'AI Models', icon: Target, color: 'green' },
    { id: 'account', name: 'Account & Billing', icon: Settings, color: 'orange' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle, color: 'red' }
  ]

  const quickStartGuides = [
    {
      title: 'Creating Your First Prompt',
      description: 'Learn the basics of prompt creation',
      steps: ['Choose a role', 'Describe your task', 'Add context', 'Generate prompt'],
      icon: '🚀'
    },
    {
      title: 'Using AI Model Routing',
      description: 'Let our system choose the best AI model',
      steps: ['Enter your task', 'Review suggestions', 'Accept or override', 'Generate'],
      icon: '🤖'
    },
    {
      title: 'Prompt Enrichment',
      description: 'Enhance your prompts with AI assistance',
      steps: ['Create basic prompt', 'Enable enrichment', 'Review improvements', 'Use enhanced prompt'],
      icon: '✨'
    },
    {
      title: 'Sharing Prompts',
      description: 'Share your successful prompts',
      steps: ['Generate prompt', 'Click share', 'Set permissions', 'Copy link'],
      icon: '🔗'
    }
  ]

  const filteredFaqs = faqData.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchTerm === '' || 
     faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-white hover:text-blue-200 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to App
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-xl text-blue-100">
            Get the most out of Promptr with our comprehensive guides and support resources
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Start Guides */}
          <div className="lg:col-span-3 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStartGuides.map((guide, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="text-3xl mb-4">{guide.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                  <ol className="text-sm text-gray-500 space-y-1">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center">
                        <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        selectedCategory === category.id 
                          ? `bg-${category.color}-100 text-${category.color}-700` 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {category.name}
                    </button>
                  )
                })}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-4 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No FAQs found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Support Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@promptr.com"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Mail className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-blue-900">Email Support</div>
                    <div className="text-sm text-blue-600">support@promptr.com</div>
                  </div>
                </a>
                
                <a
                  href="#"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <div className="font-medium text-green-900">Live Chat</div>
                    <div className="text-sm text-green-600">Available 9AM-5PM EST</div>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <div className="font-medium text-purple-900">Community</div>
                    <div className="text-sm text-purple-600">Join our Discord</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/docs" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  📚 Full Documentation
                </Link>
                <Link to="/pricing" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  💰 Pricing & Plans
                </Link>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  🎥 Video Tutorials
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  📝 Best Practices Guide
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-800 transition-colors">
                  🔄 System Status
                </a>
              </div>
            </div>

            {/* Pro Features */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <Crown className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-purple-900">Pro Support</h3>
              </div>
              <p className="text-purple-700 text-sm mb-4">
                Get priority support, advanced features, and higher usage limits with Pro.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpPage 