export interface NotificationSegment {
  label?: string | null
  value: string
  isPrimary?: boolean
}

const splitByPipe = (message: string) => {
  return message
    .split('|')
    .map(part => part.trim())
    .filter(Boolean)
}

export const parseNotificationSegments = (message?: string | null): NotificationSegment[] => {
  const raw = (message || '').trim()
  if (!raw) return []

  const parts = splitByPipe(raw)
  if (!parts.length) {
    return []
  }

  if (parts.length === 1) {
    return [{ value: parts[0], isPrimary: true }]
  }

  return parts.map((part, index) => {
    const colonIndex = part.indexOf(':')
    if (colonIndex === -1 || colonIndex === part.length - 1) {
      return {
        value: part,
        isPrimary: index === 0
      }
    }

    const label = part.slice(0, colonIndex).trim()
    const value = part.slice(colonIndex + 1).trim()

    return {
      label: label || undefined,
      value: value || '',
      isPrimary: index === 0 && !label
    }
  })
}

