import React from 'react'
import { Sparkles, Target, Zap, Settings } from 'lucide-react'
import { getEnrichmentOptions } from '../utils/promptEnricher'

const EnrichmentOptions = ({ enrichmentData, onChange, isEnriching }) => {
  const { tones } = getEnrichmentOptions()

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  const handleConstraintAdd = () => {
    const newConstraint = { type: 'length', value: '' }
    onChange('constraints', [...(enrichmentData.constraints || []), newConstraint])
  }

  const handleConstraintChange = (index, field, value) => {
    const constraints = [...(enrichmentData.constraints || [])]
    constraints[index] = { ...constraints[index], [field]: value }
    onChange('constraints', constraints)
  }

  const handleConstraintRemove = (index) => {
    const constraints = [...(enrichmentData.constraints || [])]
    constraints.splice(index, 1)
    onChange('constraints', constraints)
  }

  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mr-3 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">AI Enhancement</h3>
              <span className="badge badge-premium text-xs">Premium</span>
            </div>
            <p className="text-sm text-gray-600">Transform prompts with intelligent optimization</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Powered by</div>
          <div className="text-sm font-semibold text-gradient">Claude AI</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Tone
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <select
            value={enrichmentData.tone || ''}
            onChange={handleChange('tone')}
            className="select-field"
            disabled={isEnriching}
          >
            <option value="">Select tone...</option>
            {tones.map(tone => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Specific Goals
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={enrichmentData.goals || ''}
            onChange={handleChange('goals')}
            placeholder="What specific goals should this prompt achieve? (e.g., increase engagement, solve a problem, educate users)"
            className="textarea-field"
            rows={2}
            disabled={isEnriching}
          />
        </div>

        {/* Examples */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Examples or References
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={enrichmentData.examples || ''}
            onChange={handleChange('examples')}
            placeholder="Provide examples, references, or specific formats you'd like Claude to follow"
            className="textarea-field"
            rows={2}
            disabled={isEnriching}
          />
        </div>

        {/* Constraints */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Constraints
              <span className="text-gray-400 ml-1">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={handleConstraintAdd}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              disabled={isEnriching}
            >
              + Add Constraint
            </button>
          </div>
          
          {enrichmentData.constraints && enrichmentData.constraints.length > 0 && (
            <div className="space-y-2">
              {enrichmentData.constraints.map((constraint, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={constraint.type}
                    onChange={(e) => handleConstraintChange(index, 'type', e.target.value)}
                    className="select-field flex-1"
                    disabled={isEnriching}
                  >
                    <option value="length">Length</option>
                    <option value="format">Format</option>
                    <option value="audience">Audience</option>
                    <option value="timeline">Timeline</option>
                  </select>
                  <input
                    type="text"
                    value={constraint.value}
                    onChange={(e) => handleConstraintChange(index, 'value', e.target.value)}
                    placeholder="Enter constraint value..."
                    className="input-field flex-2"
                    disabled={isEnriching}
                  />
                  <button
                    type="button"
                    onClick={() => handleConstraintRemove(index)}
                    className="text-red-500 hover:text-red-700 px-2"
                    disabled={isEnriching}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrichment Status */}
        {isEnriching && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-3 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm font-medium">Enriching your prompt...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EnrichmentOptions 