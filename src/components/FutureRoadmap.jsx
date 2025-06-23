import React, { useState } from 'react'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Workflow,
  Rocket,
  CheckCircle,
  Circle
} from 'lucide-react'

const FutureRoadmap = () => {
  const roadmapFeatures = [
    {
      id: 'prompt-library',
      title: 'Personal Prompt Library',
      description: 'Save, organize, and search your best prompts with smart categorization.',
      status: 'in-development',
      timeline: 'Q1 2024',
      icon: BookOpen,
    },
    {
      id: 'team-collaboration',
      title: 'Team Workspaces',
      description: 'Collaborate on prompts with your team in shared workspaces.',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: Users,
    },
    {
      id: 'prompt-analytics',
      title: 'Performance Analytics',
      description: 'Track prompt effectiveness and optimize for better results.',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: BarChart3,
    },
    {
      id: 'workflow-automation',
      title: 'Workflow Automation',
      description: 'Chain prompts together into automated workflows.',
      status: 'planned',
      timeline: 'Q3 2024',
      icon: Workflow,
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-development':
        return <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <section id="roadmap" className="py-16 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-800 mb-4">
            <Rocket className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What's Next
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exciting features we're building to make your prompt engineering even more powerful
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div key={feature.id} className="card p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                    <IconComponent className="w-6 h-6 text-purple-600" />
                  </div>
                  {getStatusIcon(feature.status)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-600 font-medium">
                    {feature.timeline}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    feature.status === 'in-development' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {feature.status === 'in-development' ? 'In Progress' : 'Planned'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Have a feature request or want to stay updated?
          </p>
          <button className="btn btn-secondary">
            Join Our Community
          </button>
        </div>
      </div>
    </section>
  )
}

export default FutureRoadmap 