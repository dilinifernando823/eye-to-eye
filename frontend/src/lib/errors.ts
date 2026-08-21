import { isAxiosError } from 'axios'

interface PydanticValidationError {
  msg: string
  loc: (string | number)[]
}

/**
 * Extracts a user-friendly message from an API error. FastAPI returns
 * {"detail": "..."} for most errors and {"detail": [{msg, loc}, ...]} for
 * 422 validation errors — this surfaces those instead of the generic
 * "Request failed with status code NNN" that axios/Error.message gives.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(err)) {
    return fallback
  }

  if (!err.response) {
    return 'Unable to connect to the server. Please check your connection and try again.'
  }

  const detail: unknown = err.response.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const messages = (detail as PydanticValidationError[])
      .map((item) => item.msg)
      .filter(Boolean)
    if (messages.length > 0) return messages.join(' ')
  }

  switch (err.response.status) {
    case 401:
      return 'Invalid email or password.'
    case 403:
      return "You don't have permission to do that."
    case 404:
      return 'That could not be found.'
    case 422:
      return 'Please check the information you entered and try again.'
    case 500:
    case 502:
    case 503:
      return 'Something went wrong on our end. Please try again shortly.'
    default:
      return fallback
  }
}
