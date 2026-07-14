import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Bot, Eraser, MessageSquareText, Send, Sparkles, Zap } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { sendChatbotMessage } from '../services/chatbotApi'
import './ChatbotPage.css'

type ChatRole = 'user' | 'assistant'

type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  localOnly?: boolean
}

const quickPrompts = [
  'What can I do on the ApexAuto website?',
  'How do I create an ApexAuto account?',
  'What should I check before buying a used EV?',
  'How does cold weather affect EV range?',
]

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi, I’m Amp. Ask me about ApexAuto or general EV shopping questions.',
  localOnly: true,
}

function createMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  }
}

export default function ChatbotPage() {
  const [searchParams] = useSearchParams()
  const initialPrompt = searchParams.get('prompt')?.trim() ?? ''
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [input, setInput] = useState(initialPrompt)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const messagesRef = useRef(messages)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const initialPromptSentRef = useRef(false)
  const sendingRef = useRef(false)

  useEffect(() => {
    messagesRef.current = messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const sendMessage = async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || sendingRef.current) return

    if (trimmed.length > 1000) {
      setError('Please keep messages under 1,000 characters.')
      return
    }

    const history = messagesRef.current
      .filter((message) => !message.localOnly)
      .slice(-6)
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }))

    sendingRef.current = true
    setMessages((current) => [...current, createMessage('user', trimmed)])
    setInput('')
    setError('')
    setIsSending(true)

    try {
      const reply = await sendChatbotMessage(trimmed, history)
      setMessages((current) => [...current, createMessage('assistant', reply)])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Amp could not respond right now.')
    } finally {
      sendingRef.current = false
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (!initialPrompt || initialPromptSentRef.current) return
    initialPromptSentRef.current = true
    void sendMessage(initialPrompt)
  }, [initialPrompt])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(input)
  }

  const clearConversation = () => {
    if (isSending) return
    setMessages([welcomeMessage])
    setInput('')
    setError('')
  }

  return (
    <div className="amp-page">
      <header className="amp-header">
        <div className="amp-header-inner">
          <Link to="/" className="amp-brand" aria-label="ApexAuto home">
            <span className="amp-brand-icon"><Zap size={16} /></span>
            <span><strong>Apex</strong><em>Auto</em></span>
          </Link>
          <div className="amp-header-actions">
            <Link to="/" className="amp-header-link"><ArrowLeft size={16} /> Back home</Link>
            <Link to="/login" className="amp-sign-in">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="amp-main">
        <section className="amp-intro" aria-labelledby="amp-heading">
          <span className="amp-eyebrow"><Sparkles size={14} /> ApexAuto chatbot</span>
          <h1 id="amp-heading">Ask Amp about ApexAuto and EVs.</h1>
          <p>
            Amp can explain the current project, account pages, backend features, charging,
            range, and basic EV shopping topics.
          </p>

          <div className="amp-feature-list">
            <div><MessageSquareText size={18} /><span><strong>Project help</strong> based on the ApexAuto knowledge file</span></div>
            <div><Bot size={18} /><span><strong>General EV answers</strong> through the backend Gemini connection</span></div>
          </div>

          <div className="amp-quick-section">
            <h2>Try asking</h2>
            <div className="amp-quick-grid">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} disabled={isSending}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="amp-chat-card" aria-label="Chat with Amp">
          <div className="amp-chat-topbar">
            <div className="amp-agent">
              <span className="amp-agent-avatar"><Sparkles size={18} /></span>
              <div>
                <strong>Amp</strong>
                <span><i /> Ready</span>
              </div>
            </div>
            <button type="button" className="amp-clear" onClick={clearConversation} disabled={isSending}>
              <Eraser size={16} /> Clear
            </button>
          </div>

          <div className="amp-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`amp-message-row amp-${message.role}`}>
                {message.role === 'assistant' && <span className="amp-mini-avatar"><Sparkles size={14} /></span>}
                <div className="amp-message-bubble">{message.content}</div>
              </div>
            ))}

            {isSending && (
              <div className="amp-message-row amp-assistant">
                <span className="amp-mini-avatar"><Sparkles size={14} /></span>
                <div className="amp-message-bubble amp-typing" aria-label="Amp is typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="amp-composer-wrap">
            {error && <p className="amp-error" role="alert">{error}</p>}
            <form className="amp-composer" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                placeholder="Ask about ApexAuto or EVs…"
                rows={1}
                maxLength={1000}
                disabled={isSending}
                aria-label="Message Amp"
              />
              <button type="submit" disabled={isSending || !input.trim()} aria-label="Send message">
                <Send size={18} />
              </button>
            </form>
            <p className="amp-disclaimer">Do not share passwords, API keys, access tokens, or payment details.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
