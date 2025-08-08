// Frontend Attachment Service (scaffold)

export class AttachmentService {
  static async computeSha256(file) {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  static async extractText(file) {
    if (file.type.startsWith('text/') || file.type === 'application/json') {
      return await file.text()
    }
    // For PDFs/DOCX we will add client-side parsers later; keep cheap by default
    return null
  }

  static async upload(file, { title } = {}) {
    // Placeholder to call backend upload API when implemented
    const contentHash = await this.computeSha256(file)
    return { success: true, contentHash, title: title || file.name }
  }

  static async list() {
    return { success: true, data: [] }
  }

  static async remove(documentId) {
    return { success: true, deleted: documentId }
  }
}

export default AttachmentService


