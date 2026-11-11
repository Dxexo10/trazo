import type {} from '../../middleware/request-id.js'

declare global {
  namespace Express {
    interface Request {
      requestId: string
    }
  }
}

export {}
