import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                         nextUrl.pathname.startsWith('/signup') ||
                         nextUrl.pathname.startsWith('/setup')

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/', nextUrl))
      }

      if (!isLoggedIn && !isAuthPage) return false
      return true
    }
  },
  providers: [],
}