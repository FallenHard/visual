import { NextResponse } from "next/server"

export function middleware(request) {
  const token = request.cookies.get("token")?.value

  // Verifica se está tentando acessar uma rota protegida
  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Define quais rotas o middleware protege
export const config = {
  matcher: ["/dashboard/:path*"],
}
