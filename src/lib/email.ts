import emailjs, { EmailJSResponseStatus } from '@emailjs/browser'
import { appConfig, hasRequiredEmailJsConfig } from '../config/appConfig'

const missingConfigMessage =
  'EmailJS is not configured yet. Add the required Vite env keys and try again.'

export async function sendApplicationEmail(toEmail: string) {
  if (!hasRequiredEmailJsConfig) {
    throw new Error(missingConfigMessage)
  }

  try {
    await emailjs.send(
      appConfig.emailjs.serviceId,
      appConfig.emailjs.templateId,
      {
        to_email: toEmail,
        email: toEmail,
        recipient_email: toEmail,
      },
      {
        publicKey: appConfig.emailjs.publicKey,
        limitRate: {
          id: 'apply-direct-send',
          throttle: appConfig.emailThrottleMs,
        },
      },
    )
  } catch (error) {
    if (error instanceof EmailJSResponseStatus) {
      throw new Error(
        `EmailJS rejected the request with status ${error.status}. Check your service, template, and public key.`,
      )
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : 'Unable to send the application email.',
    )
  }
}
