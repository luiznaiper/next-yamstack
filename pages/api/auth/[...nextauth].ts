import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import Providers from 'next-auth/providers'

const options: NextAuthOptions = {
  theme: 'light',
  debug: true,
  session: {
    jwt: true,
    maxAge: 60 * 15,
  },
  jwt: {
    encryption: true,
    encryptionKey: process.env.AUTH_JWT_ENCRYPTION_KEY,
    secret: process.env.AUTH_JWT_SECRET,
    signingKey: process.env.AUTH_JWT_SIGNING_KEY,
  },
  providers: [
    Providers.Credentials({
      name: 'Naiper',
      credentials: {
        password: {
          type: 'password',
          label: 'Keep programming!',
        },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/naiper`, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-type': 'application/json' },
        })

        const user = await res.json()

        if (res.ok && user) {
          return user
        }
        return null
      },
    }),
    Providers.GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
}

export default NextAuth(options)
