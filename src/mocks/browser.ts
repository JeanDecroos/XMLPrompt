import { setupWorker } from 'msw'
import { profileHandlers } from './handlers/profile'

export const worker = setupWorker(...profileHandlers)


