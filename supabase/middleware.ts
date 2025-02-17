// File: supabase/middleware.ts
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response that will be passed to the Supabase client
  const response = NextResponse.next()

  // Create an Edge‑compatible Supabase client
  const supabase = createMiddlewareSupabaseClient({ req: request, res: response })

  // Retrieve the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session exists and the user is not already on an auth route, redirect to login
  if (
      !session &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return response
}
