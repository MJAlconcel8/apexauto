import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Bot, Eraser, MessageSquareText, Send, Sparkles } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Btn, Footer } from '../components'
import Nav from '../components/Nav'
import { sendChatbotMessage } from '../services/chatbotApi'

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
    <div className="flex min-h-screen flex-col bg-apex-paper bg-[radial-gradient(circle_at_8%_18%,rgba(14,99,255,0.11),transparent_24rem)] pt-16 font-body text-apex-ink">
      <Nav />

      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-[min(1200px,calc(100%-40px))] flex-1 grid-cols-1 items-center gap-9 py-[clamp(42px,7vw,78px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(480px,1.18fr)] lg:gap-[clamp(36px,7vw,86px)] max-sm:w-[min(1200px,calc(100%-24px))] max-sm:gap-7 max-sm:pt-[30px]">
        <section className="max-w-[680px]" aria-labelledby="amp-heading">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-apex-voltage-ink">
            <Sparkles size={14} /> ApexAuto chatbot
          </span>

          <h1
            id="amp-heading"
            className="my-4 max-w-[620px] font-display text-[clamp(38px,5vw,62px)] font-black leading-[0.98] tracking-[-0.045em] text-apex-ink max-sm:text-[39px]"
          >
            Ask Amp about ApexAuto and EVs.
          </h1>

          <p className="max-w-[570px] text-[17px] leading-[1.65] text-apex-muted max-sm:text-[15px]">
            Amp can explain the current project, account pages, backend features, charging,
            range, and basic EV shopping topics.
          </p>

          <div className="my-7 grid gap-3 text-sm text-apex-muted">
            <div className="flex items-center gap-3">
              <MessageSquareText className="shrink-0 text-apex-voltage" size={18} />
              <span>
                <strong className="text-apex-ink">Project help</strong> based on the ApexAuto knowledge file
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Bot className="shrink-0 text-apex-voltage" size={18} />
              <span>
                <strong className="text-apex-ink">General EV answers</strong> through the backend Gemini connection
              </span>
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-[15px] tracking-[0.02em]">Try asking</h2>
            <fieldset
              disabled={isSending}
              className={`m-0 min-w-0 border-0 p-0 ${isSending ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <Btn
                    key={prompt}
                    variant="quiet"
                    size="sm"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </Btn>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section
          className="grid h-[min(710px,calc(100vh-118px))] min-h-[570px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[18px] border border-white/[0.08] bg-apex-ink shadow-[0_34px_78px_-34px_rgba(18,22,28,0.65)] max-lg:h-[680px] max-sm:h-[670px] max-sm:min-h-[540px] max-sm:rounded-[14px]"
          aria-label="Chat with Amp"
        >
          <div className="flex min-h-[68px] items-center justify-between border-b border-white/10 px-4 py-[13px]">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-full border border-apex-voltage/40 bg-apex-voltage/20 text-apex-voltage">
                <Sparkles size={18} />
              </span>
              <div>
                <strong className="block font-display text-[15px] text-white">Amp</strong>
                <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] text-apex-muted-ink">
                  <i className="size-1.5 rounded-full bg-apex-green" /> Ready
                </span>
              </div>
            </div>

            <fieldset
              disabled={isSending}
              className={`m-0 min-w-0 border-0 p-0 ${isSending ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <Btn variant="ghostDark" size="sm" icon={Eraser} onClick={clearConversation}>
                Clear
              </Btn>
            </fieldset>
          </div>

          <div
            className="overflow-y-auto px-[18px] py-5 [scrollbar-color:#334050_transparent]"
            aria-live="polite"
          >
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant'

              return (
                <div
                  key={message.id}
                  className={`mb-3.5 flex items-start gap-2 ${isAssistant ? '' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-apex-voltage/40 bg-apex-voltage/20 text-apex-voltage">
                      <Sparkles size={14} />
                    </span>
                  )}

                  <div
                    className={`max-w-[min(82%,520px)] whitespace-pre-wrap px-3.5 py-3 text-sm leading-[1.55] [overflow-wrap:anywhere] max-sm:max-w-[88%] ${
                      isAssistant
                        ? 'rounded-[14px_14px_14px_4px] border border-white/10 bg-apex-ink-2 text-[#f4f7fb]'
                        : 'rounded-[14px_14px_4px_14px] bg-apex-voltage text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              )
            })}

            {isSending && (
              <div className="mb-3.5 flex items-start gap-2">
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-apex-voltage/40 bg-apex-voltage/20 text-apex-voltage">
                  <Sparkles size={14} />
                </span>
                <div
                  className="flex min-w-[60px] items-center justify-center gap-1.5 rounded-[14px_14px_14px_4px] border border-white/10 bg-apex-ink-2 px-3.5 py-3"
                  aria-label="Amp is typing"
                >
                  <span className="size-1.5 rounded-full bg-apex-muted-ink motion-safe:animate-bounce motion-reduce:animate-none" />
                  <span className="size-1.5 rounded-full bg-apex-muted-ink motion-safe:animate-bounce motion-reduce:animate-none [animation-delay:120ms]" />
                  <span className="size-1.5 rounded-full bg-apex-muted-ink motion-safe:animate-bounce motion-reduce:animate-none [animation-delay:240ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 px-3.5 pb-[13px] pt-3">
            {error && (
              <p className="mb-2 text-xs text-[#ff8b8b]" role="alert">
                {error}
              </p>
            )}

            <form
              className="flex items-end gap-2 rounded-[14px] border border-white/10 bg-apex-ink-2 py-[7px] pl-3.5 pr-[7px] focus-within:border-apex-voltage/75"
              onSubmit={handleSubmit}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    event.currentTarget.form?.requestSubmit()
                  }
                }}
                className="av-focus max-h-[120px] w-full resize-none border-0 bg-transparent text-sm leading-6 text-white outline-none placeholder:text-[#778392] disabled:cursor-not-allowed"
                placeholder="Ask about ApexAuto or EVs…"
                rows={1}
                maxLength={1000}
                disabled={isSending}
                aria-label="Message Amp"
              />

              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="av-focus inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-apex-voltage text-white transition-colors hover:bg-apex-voltage-ink disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>

            <p className="mx-1 mt-2 text-center text-[10px] text-[#778392]">
              Do not share passwords, API keys, access tokens, or payment details.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
