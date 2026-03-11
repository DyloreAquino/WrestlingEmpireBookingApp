import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                         nextUrl.pathname.startsWith('/signup')
      if (!isLoggedIn && !isAuthPage) return false
      return true
    }
  },
  providers: [], // no providers here — just config
}