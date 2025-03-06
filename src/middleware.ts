import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicRoutes = ['/signin', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET
  })
  
  if (!token && !isPublicRoute) {
    const url = new URL('/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(process.env.NEXT_PUBLIC_APP_URL!))
    return NextResponse.redirect(url)
  }
  
  if (token && pathname === '/signin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
} 