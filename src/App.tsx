import { useEffect, useEffectEvent, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { ToastViewport, type ToastState } from './components/ToastViewport'
import {
  appConfig,
  hasRequiredEmailJsConfig,
} from './config/appConfig'
import { sendApplicationEmail } from './lib/email'
import { loadResumeAttachment } from './lib/resume'

function App() {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resumeReady, setResumeReady] = useState(false)
  const [resumeStatusText, setResumeStatusText] = useState(
    `Preparing ${appConfig.resume.fileName}...`,
  )
  const [toast, setToast] = useState<ToastState | null>(null)

  const dismissToast = useEffectEvent(() => {
    setToast(null)
  })

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      dismissToast()
    }, 4200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [toast])

  useEffect(() => {
    let isMounted = true

    loadResumeAttachment(appConfig.resume.path)
      .then((attachment) => {
        if (!isMounted) {
          return
        }

        setResumeReady(true)
        setResumeStatusText(`${attachment.fileName} is attached by default.`)
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setResumeReady(false)
        setResumeStatusText(
          `Resume could not be loaded from ${appConfig.resume.path}.`,
        )
      })

    return () => {
      isMounted = false
    }
  }, [])

  const canSubmit =
    hasRequiredEmailJsConfig &&
    resumeReady &&
    !isSubmitting &&
    recipientEmail.trim().length > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = recipientEmail.trim()

    if (!trimmedEmail) {
      setToast({
        variant: 'error',
        title: 'Recipient required',
        message: 'Enter the hiring email address before sending.',
      })
      return
    }

    if (!hasRequiredEmailJsConfig) {
      setToast({
        variant: 'error',
        title: 'EmailJS setup incomplete',
        message: 'Add your EmailJS keys in the Vite env file first.',
      })
      return
    }

    if (!resumeReady) {
      setToast({
        variant: 'error',
        title: 'Resume unavailable',
        message: resumeStatusText,
      })
      return
    }

    setIsSubmitting(true)

    try {
      await sendApplicationEmail(trimmedEmail)
      setRecipientEmail('')
      setToast({
        variant: 'success',
        title: 'Email sent',
        message: `Your application package was sent to ${trimmedEmail}.`,
      })
    } catch (error) {
      setToast({
        variant: 'error',
        title: 'Send failed',
        message:
          error instanceof Error
            ? error.message
            : 'Something went wrong while sending the email.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">

      <section className="composer-card">
        <div className="composer-topline">
          <div>
            <p className="section-label">Application Sender</p>
            <h2>One input. One click.</h2>
          </div>
          <span
            className={`status-pill ${resumeReady ? 'is-ready' : 'is-warning'}`}
          >
            {resumeReady ? 'Resume ready' : 'Resume issue'}
          </span>
        </div>

        <form className="application-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Hiring email address</span>
            <input
              type="email"
              placeholder="hiring@company.com"
              autoComplete="email"
              inputMode="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              required
            />
          </label>

          <button className="submit-button" type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Sending application...' : 'Send application email'}
          </button>
        </form>

      </section>

      <ToastViewport toast={toast} onDismiss={() => setToast(null)} />
    </main>
  )
}

export default App
