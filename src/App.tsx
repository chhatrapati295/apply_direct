import { useEffect, useEffectEvent, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { ToastViewport, type ToastState } from './components/ToastViewport'
import { hasRequiredEmailJsConfig } from './config/appConfig'
import { sendApplicationEmail } from './lib/email'

function App() {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clipboardText, setClipboardText] = useState('')
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
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleWindowFocus = () => {
      if (!navigator.clipboard?.readText) {
        return
      }

      void navigator.clipboard
        .readText()
        .then((copiedText) => {
          setClipboardText(copiedText.trim())
        })
        .catch(() => {
          setClipboardText('')
        })
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  const canSubmit =
    hasRequiredEmailJsConfig &&
    !isSubmitting &&
    recipientEmail.trim().length > 0

  const showPasteButton =
    clipboardText.length > 0 && clipboardText.trim() !== recipientEmail.trim()

  const handlePasteFromClipboard = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      return
    }

    try {
      const copiedText = (await navigator.clipboard.readText()).trim()

      if (!copiedText) {
        setClipboardText('')
        return
      }

      setRecipientEmail(copiedText)
      setClipboardText(copiedText)
    } catch {
      setToast({
        variant: 'error',
        title: 'Clipboard unavailable',
        message: 'Unable to read from your clipboard right now.',
      })
    }
  }

  const handleInputFocus = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
      return
    }

    try {
      const copiedText = (await navigator.clipboard.readText()).trim()
      setClipboardText(copiedText)
    } catch {
      setClipboardText('')
    }
  }

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

    setIsSubmitting(true)

    try {
      await sendApplicationEmail(trimmedEmail)
      setRecipientEmail('')
      setToast({
        variant: 'success',
        title: 'Email sent',
        message: `Your application email was sent to ${trimmedEmail}.`,
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
          <span className="status-pill is-ready">Email ready</span>
        </div>

        <form className="application-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Hiring email address</span>
            <div className="input-shell">
              <input
                type="email"
                placeholder="hiring@company.com"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                value={recipientEmail}
                onFocus={() => {
                  void handleInputFocus()
                }}
                onChange={(event) => setRecipientEmail(event.target.value)}
                required
              />
              {showPasteButton && (
                <button
                  className="paste-button"
                  type="button"
                  onClick={() => {
                    void handlePasteFromClipboard()
                  }}
                >
                  Paste
                </button>
              )}
            </div>
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
