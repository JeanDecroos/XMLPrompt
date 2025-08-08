import React, { useState } from 'react'
import AttachmentService from '../../services/attachmentService'

const AttachmentManager = () => {
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const result = await AttachmentService.upload(file, { title: file.name })
      if (result?.success) {
        setItems(prev => [{ id: result.contentHash, title: result.title }, ...prev])
      }
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Attachments</h3>
        <label className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700">
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="text-sm text-gray-700 dark:text-gray-200">{item.title}</li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-gray-500 dark:text-gray-400">No attachments yet.</li>
        )}
      </ul>
    </div>
  )
}

export default AttachmentManager


