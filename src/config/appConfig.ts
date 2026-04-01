import bundledResumeUrl from '../../resume_chhatrapati.pdf?url'

const trimEnv = (value?: string) => value?.trim() ?? ''

const normalizePath = (path: string) => {
  if (!path) {
    return bundledResumeUrl
  }

  return path.startsWith('/') ? path : `/${path}`
}

const fileNameFromPath = (path: string) =>
  path.split('/').filter(Boolean).at(-1) ?? 'resume.pdf'

const configuredResumePath = normalizePath(trimEnv(import.meta.env.VITE_RESUME_PATH))

export const appConfig = {
  emailjs: {
    publicKey: trimEnv(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
    serviceId: trimEnv(import.meta.env.VITE_EMAILJS_SERVICE_ID),
    templateId: trimEnv(import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
  },
  resume: {
    path: configuredResumePath,
    attachmentParam: 'resume_attachment',
    fileNameParam: 'resume_filename',
    contentTypeParam: 'resume_content_type',
    fileName: trimEnv(import.meta.env.VITE_RESUME_FILENAME)
      || (configuredResumePath === bundledResumeUrl
        ? 'resume_chhatrapati.pdf'
        : fileNameFromPath(configuredResumePath)),
  },
  emailThrottleMs: 15_000,
} as const

export const missingEmailJsConfig = [
  ['VITE_EMAILJS_PUBLIC_KEY', appConfig.emailjs.publicKey],
  ['VITE_EMAILJS_SERVICE_ID', appConfig.emailjs.serviceId],
  ['VITE_EMAILJS_TEMPLATE_ID', appConfig.emailjs.templateId],
]
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const hasRequiredEmailJsConfig = missingEmailJsConfig.length === 0
