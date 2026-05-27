import { AGENT_ORDER, AGENTS } from './campaign-agents.js'

export function buildAgentSteps(events = []) {
  const steps = AGENT_ORDER.map((id) => ({
    id,
    name: AGENTS[id].name,
    status: 'pending'
  }))

  for (const event of events) {
    const step = steps.find((s) => s.id === event.agent)
    if (!step) continue

    if (event.type === 'agent_start') {
      step.status = 'running'
    }
    if (event.type === 'agent_done') {
      step.status = event.validation && !event.validation.ok ? 'error' : 'done'
      step.validation = event.validation
    }
  }

  if (events.some((e) => e.type === 'error')) {
    const running = steps.find((s) => s.status === 'running')
    if (running) running.status = 'error'
  }

  return steps
}
