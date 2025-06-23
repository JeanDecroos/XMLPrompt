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
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg mr-3">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prompt Enrichment</h3>
          <p className="text-sm text-gray-600">Enhance your prompt with AI-powered optimization</p>
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