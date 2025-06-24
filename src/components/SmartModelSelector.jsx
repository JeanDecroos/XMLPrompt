/**
 * Smart Model Selector Component
 * 
 * Demonstrates the semantic model routing engine with an interactive UI
 * Shows how role + task combinations intelligently route to optimal models
 */

import React, { useState, useEffect } from 'react';
import { routeToOptimalModel } from '../services/ModelRoutingEngine.js';

const SAMPLE_ROLES = [
  'Software Developer',
  'Data Scientist', 
  'Designer',
  'Content Creator',
  'Product Manager',
  'Business Analyst',
  'Marketing Manager',
  'Researcher',
  'Technical Writer',
  'Business Consultant'
];

const SAMPLE_TASKS = {
  'Software Developer': [
    'Generate a complex React component with TypeScript interfaces',
    'Debug a performance issue in a multi-threaded application',
    'Review code for security vulnerabilities',
    'Refactor legacy codebase for better maintainability',
    'Create comprehensive unit tests for a complex algorithm'
  ],
  'Data Scientist': [
    'Analyze large dataset with statistical modeling',
    'Solve complex mathematical optimization problem',
    'Build predictive model with feature engineering',
    'Perform exploratory data analysis on customer data',
    'Create data visualization dashboard'
  ],
  'Designer': [
    'Create a professional logo with clear text rendering',
    'Design user interface mockups for mobile app',
    'Generate marketing visuals for social media campaign',
    'Create brand identity package with multiple assets',
    'Design infographic for complex data presentation'
  ],
  'Content Creator': [
    'Generate high-quality promotional video with audio',
    'Compose instrumental background music for podcast',
    'Write engaging blog post with SEO optimization',
    'Create social media content calendar',
    'Produce educational video tutorial series'
  ],
  'Researcher': [
    'Conduct comprehensive literature review across domains',
    'Analyze research papers for systematic review',
    'Generate hypothesis for experimental design',
    'Synthesize findings from multiple studies',
    'Write academic paper with proper citations'
  ]
};

const SmartModelSelector = () => {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [taskInput, setTaskInput] = useState('');
  const [constraints, setConstraints] = useState({
    maxCost: false,
    prioritizeSpeed: false,
    requireMultimodal: false
  });
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-populate task examples based on role
  const sampleTasks = SAMPLE_TASKS[selectedRole] || [];

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setTaskInput(''); // Clear task when role changes
    setRecommendation(null);
  };

  const handleTaskSelect = (task) => {
    setTaskInput(task);
  };

  const getRecommendation = async () => {
    if (!taskInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Simulate slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = routeToOptimalModel(selectedRole, taskInput, constraints);
      setRecommendation(result);
    } catch (error) {
      console.error('Routing error:', error);
      setRecommendation({
        error: 'Failed to get recommendation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConstraintChange = (constraint, value) => {
    setConstraints(prev => ({
      ...prev,
      [constraint]: value
    }));
  };

  // Auto-update recommendation when inputs change
  useEffect(() => {
    if (taskInput.trim()) {
      const timeoutId = setTimeout(getRecommendation, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedRole, taskInput, constraints]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 Semantic Model Routing Engine
        </h1>
        <p className="text-lg text-gray-600">
          Intelligent AI model selection based on role context and task semantics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              👤 Role Selection
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    selectedRole === role
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              📋 Task Description
            </h2>
            
            {sampleTasks.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Sample tasks for {selectedRole}:</p>
                <div className="space-y-1">
                  {sampleTasks.map((task, index) => (
                    <button
                      key={index}
                      onClick={() => handleTaskSelect(task)}
                      className="block w-full text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Describe your specific task in detail..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Constraints */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xl font-semibold mb-4"
            >
              <span>⚙️ Advanced Constraints</span>
              <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showAdvanced && (
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={constraints.maxCost}
                    onChange={(e) => handleConstraintChange('maxCost', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>💰 Prioritize cost-effectiveness</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={constraints.prioritizeSpeed}
                    onChange={(e) => handleConstraintChange('prioritizeSpeed', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>⚡ Prioritize speed and efficiency</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={constraints.requireMultimodal}
                    onChange={(e) => handleConstraintChange('requireMultimodal', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>🎨 Require multimodal capabilities</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoading && (
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-800">Analyzing requirements and finding optimal model...</p>
            </div>
          )}

          {recommendation && !isLoading && (
            <>
              {recommendation.error ? (
                <div className="bg-red-50 p-6 rounded-lg">
                  <p className="text-red-800">{recommendation.error}</p>
                </div>
              ) : (
                <>
                  {/* Primary Recommendation */}
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      🎯 Primary Recommendation
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-green-800">
                          {recommendation.primary.model.name}
                        </h3>
                        <span className={`text-sm font-medium ${getConfidenceColor(recommendation.primary.confidence)}`}>
                          {getConfidenceLabel(recommendation.primary.confidence)} ({(recommendation.primary.confidence * 100).toFixed(1)}%)
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Provider:</strong> {recommendation.primary.model.provider}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Match Score:</strong> {(recommendation.primary.score * 100).toFixed(1)}%
                      </div>
                      
                      <div className="bg-white p-3 rounded border">
                        <strong className="text-sm">Why this model:</strong>
                        <p className="text-sm text-gray-700 mt-1">
                          {recommendation.primary.reasoning}
                        </p>
                      </div>
                      
                      {recommendation.primary.model.pricing && (
                        <div className="text-sm text-gray-600">
                          <strong>Pricing:</strong> ${recommendation.primary.model.pricing.input}/M input tokens, 
                          ${recommendation.primary.model.pricing.output}/M output tokens
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alternative Recommendations */}
                  {recommendation.alternatives.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        🔄 Alternative Options
                      </h2>
                      
                      <div className="space-y-3">
                        {recommendation.alternatives.map((alt, index) => (
                          <div key={index} className="bg-white p-4 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{alt.model.name}</h4>
                              <span className="text-sm text-gray-500">
                                {(alt.score * 100).toFixed(1)}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{alt.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      📊 Analysis Metadata
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Total Candidates:</strong> {recommendation.metadata.totalCandidates}
                      </div>
                      <div>
                        <strong>Routing Confidence:</strong> {(recommendation.metadata.routingConfidence * 100).toFixed(1)}%
                      </div>
                      <div className="col-span-2">
                        <strong>Applied Constraints:</strong> {
                          Object.entries(constraints).filter(([, value]) => value).length > 0
                            ? Object.entries(constraints).filter(([, value]) => value).map(([key]) => key).join(', ')
                            : 'None'
                        }
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {!recommendation && !isLoading && taskInput.trim() && (
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <p className="text-yellow-800">Enter a task description to get model recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          🔬 How Semantic Routing Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">🧠</div>
            <h3 className="font-medium mb-2">Semantic Analysis</h3>
            <p className="text-gray-600">
              Analyzes role context and task description using vector embeddings and pattern matching
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <h3 className="font-medium mb-2">Capability Matching</h3>
            <p className="text-gray-600">
              Computes cosine similarity between requirements and model capability vectors
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-medium mb-2">Intelligent Ranking</h3>
            <p className="text-gray-600">
              Ranks models by match score and confidence, providing explainable recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartModelSelector; 