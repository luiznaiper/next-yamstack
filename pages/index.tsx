import { useEffect } from 'react'
import { Grid } from '@ui/Grid'
import { Button } from '@ui/Button'
import { Typography } from '@ui/Typography'
import { Layout } from '@components/Layout'
import { getPlantList } from '@api'

export default function Home() {
  useEffect(() => {
    getPlantList({ limit: 10 }).then((data) => {
      data.forEach((item) => {
        console.log(item.author.fullName)
      })
    })
  }, [])
  return <Layout>Hola</Layout>
}
