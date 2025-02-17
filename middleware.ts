// File: middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from './supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        // Apply middleware to all paths except static files, images, favicon, etc.
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
