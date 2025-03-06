import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = ['/signin', '/api'].some(path => 
    nextUrl.pathname.startsWith(path)
  );

  if (nextUrl.pathname.match(/\.(ico|jpg|jpeg|png|gif|svg)$/)) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/signin', nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname === '/signin') {
    return Response.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};