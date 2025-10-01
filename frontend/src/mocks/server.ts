/**
 * MSW Server Setup for Node.js (Jest tests)
 */

import { http } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception for Node environment (Jest tests)
export const server = setupServer(...handlers);

// Re-export http for test overrides
export { http };
