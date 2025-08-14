import React from 'react'
import EnrichmentScaleBar from './EnrichmentScaleBar'

const EnrichmentOptions = ({ enrichmentData, onChange, isEnriching }) => {

  return (
    <div className="space-y-4">
      {/* Simple Enhancement Level Control */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Enhancement Level</h4>
          <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Level {enrichmentData.enrichmentLevel || 3}
          </div>
        </div>
        
        <EnrichmentScaleBar
          value={enrichmentData.enrichmentLevel || 3}
          onChange={(value) => onChange('enrichmentLevel', value)}
          disabled={isEnriching}
        />
      </div>
    </div>
  )
}

export default EnrichmentOptions 