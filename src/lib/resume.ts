type ResumeAttachment = {
  base64: string
  contentType: string
  fileName: string
}

let cachedPath = ''
let cachedAttachmentPromise: Promise<ResumeAttachment> | null = null

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const fileNameFromPath = (path: string) =>
  path.split('/').filter(Boolean).at(-1) ?? 'resume.pdf'

const mimeFromPath = (path: string) => {
  const extension = fileNameFromPath(path).split('.').at(-1)?.toLowerCase()
  return (extension && MIME_BY_EXTENSION[extension]) || 'application/octet-stream'
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Unable to encode the resume attachment.'))
    }

    reader.onerror = () => {
      reject(new Error('Unable to read the resume file.'))
    }

    reader.readAsDataURL(blob)
  })

async function loadResumeBlob(path: string) {
  const response = await fetch(path, { cache: 'no-cache' })

  if (!response.ok) {
    throw new Error(
      `The resume file could not be loaded from ${path}. Replace the placeholder with your actual resume.`,
    )
  }

  const blob = await response.blob()

  if (!blob.size) {
    throw new Error(`The resume file at ${path} is empty.`)
  }

  return blob
}

export async function loadResumeAttachment(path: string) {
  if (cachedAttachmentPromise && cachedPath === path) {
    return cachedAttachmentPromise
  }

  cachedPath = path
  cachedAttachmentPromise = (async () => {
    const blob = await loadResumeBlob(path)

    return {
      base64: await blobToDataUrl(blob),
      contentType: blob.type || mimeFromPath(path),
      fileName: fileNameFromPath(path),
    }
  })().catch((error) => {
    cachedAttachmentPromise = null
    throw error
  })

  return cachedAttachmentPromise
}

export async function loadResumeAttachmentWithName(
  path: string,
  fileName: string,
) {
  const attachment = await loadResumeAttachment(path)

  return {
    ...attachment,
    fileName,
  }
}
