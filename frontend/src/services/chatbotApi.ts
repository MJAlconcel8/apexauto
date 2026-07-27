import { API_BASE_URL } from '../config/api'
export type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatbotApiResponse = {
  message?: string
  detail?: string
  error?: string
}
export async function sendChatbotMessage(
  message: string,
  history: ChatHistoryMessage[],
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  })

  const data = (await response.json().catch(() => null)) as ChatbotApiResponse | null

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || data?.error || 'Amp could not respond right now.')
  }

  if (!data?.message) {
    throw new Error('Amp returned an empty response.')
  }

  return data.message
}
