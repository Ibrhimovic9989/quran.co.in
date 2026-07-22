// NextAuth API Route Handler
// Handles all authentication requests

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// NextAuth v5 beta: NextAuth returns an object with handlers and auth function
const authHandler = NextAuth(authOptions);

// Extract and export GET and POST handlers
export const { handlers, auth } = authHandler;
export const { GET, POST } = handlers;
