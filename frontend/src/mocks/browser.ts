/**
 * MSW Browser Setup for development
 * This can be used for local development to mock the API
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup requests interception for browser environment
export const worker = setupWorker(...handlers);
