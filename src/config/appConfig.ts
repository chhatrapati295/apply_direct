const trimEnv = (value?: string) => value?.trim() ?? ''

export const appConfig = {
  emailjs: {
    publicKey: trimEnv(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
    serviceId: trimEnv(import.meta.env.VITE_EMAILJS_SERVICE_ID),
    templateId: trimEnv(import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
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
