import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/app/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) return null

        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
        if (!valid) return null

        return { 
            id: String(user.id), 
            email: user.email, 
            activeUniverseId: user.activeUniverseId 
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
    if (user) {
        token.id = user.id
        token.activeUniverseId = (user as any).activeUniverseId
    }
    if (token.id) {
        const dbUser = await prisma.user.findUnique({
        where: { id: Number(token.id) },
        select: { activeUniverseId: true }
        })
        token.activeUniverseId = dbUser?.activeUniverseId ?? null
    }
    return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.activeUniverseId = token.activeUniverseId as number | null
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})