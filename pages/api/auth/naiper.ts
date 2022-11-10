import type { NextApiHandler } from 'next'

const credentialsAuth: NextApiHandler<User> = (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).end()
    return
  }

  if (request.body.password === process.env.AUTH_NAIPER_SECRET) {
    const naiperUser: User = {
      name: 'Luiznaiper',
      email: 'luis@luis.com',
      image: 'naiper.png',
    }
    return response.status(200).json(naiperUser)
  }

  response.status(404).end()
}

export default credentialsAuth
