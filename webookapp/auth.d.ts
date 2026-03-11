declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      activeUniverseId: number | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    activeUniverseId?: number | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    activeUniverseId: number | null
  }
}