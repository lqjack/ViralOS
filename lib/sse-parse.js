/**
 * Parse Server-Sent Events (data: JSON lines) from accumulated stream text.
 * @param {string} buffer
 * @param {string} [remainder] - incomplete trailing chunk from prior read
 * @returns {{ events: object[], remainder: string }}
 */
export function parseSseBuffer(buffer, remainder = '') {
  const combined = remainder + buffer
  const parts = combined.split('\n\n')
  const nextRemainder = parts.pop() ?? ''
  const events = []

  for (const part of parts) {
    const line = part.trim()
    if (!line.startsWith('data:')) continue
    const json = line.slice(5).trim()
    if (!json) continue
    try {
      events.push(JSON.parse(json))
    } catch {
      events.push({ type: 'parse_error', raw: json })
    }
  }

  return { events, remainder: nextRemainder }
}

/**
 * Consume a fetch Response body and collect all SSE JSON events.
 * @param {Response} response
 * @returns {Promise<object[]>}
 */
export async function readSseEventsFromResponse(response) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let remainder = ''
  const events = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    const parsed = parseSseBuffer(chunk, remainder)
    remainder = parsed.remainder
    events.push(...parsed.events)
  }

  if (remainder.trim()) {
    const parsed = parseSseBuffer('\n\n', remainder)
    events.push(...parsed.events)
  }

  return events
}
